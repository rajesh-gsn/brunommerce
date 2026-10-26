import { detectContentTypeFromBase64 } from './index';

const MAX_SCAN_NODES = 2000;
const MAX_SCAN_DEPTH = 6;
// Matches the response size above which ResponsePane skips detection, so no label in a response it scans is missed
const MAX_STRING_LENGTH = 10 * 1024 * 1024;
const MIN_BASE64_LENGTH = 16;

// Image types a browser can show, with the extension to save them under
export const LABEL_IMAGE_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg'
};

const DATA_URL_IMAGE_REGEX = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/\s]+={0,2})$/i;
const SVG_REGEX = /^\s*(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)?(?:<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i;

const ZPL_START_REGEX = /\^XA/gi;
const ZPL_END_REGEX = /\^XZ/gi;
const BASE64_REGEX = /^[A-Za-z0-9+/\s]+={0,2}$/;

// Either a CDATA section (group 1) or the ordinary text that follows a '>' up to the next tag (group 2)
const XML_TEXT_REGEX = /<!\[CDATA\[([\s\S]*?)\]\]>|(?<=>)([^<]+)(?=<)/g;
const XML_ENTITY_REGEX = /&(?:#x([0-9a-fA-F]+)|#(\d+)|(lt|gt|quot|apos|amp));/g;
const NAMED_ENTITIES = { lt: '<', gt: '>', quot: '"', apos: '\'', amp: '&' };
const MAX_CODE_POINT = 0x10FFFF;
const CARRIAGE_RETURN = 13;

// Finds each ^XA..^XZ block in a single pass; an unterminated ^XA ends the scan instead of rescanning to the end per start
const extractZplLabels = (text) => {
  const labels = [];
  ZPL_START_REGEX.lastIndex = 0;

  let start;
  while ((start = ZPL_START_REGEX.exec(text))) {
    ZPL_END_REGEX.lastIndex = start.index + 3;
    if (!ZPL_END_REGEX.exec(text)) break;
    labels.push({ kind: 'zpl', content: text.slice(start.index, ZPL_END_REGEX.lastIndex) });
    ZPL_START_REGEX.lastIndex = ZPL_END_REGEX.lastIndex;
  }

  return labels;
};

const toImage = (mime, base64) => (mime in LABEL_IMAGE_EXTENSIONS ? [{ kind: 'image', mime, content: base64 }] : []);

const detectInString = (str) => {
  if (typeof str !== 'string' || str.length === 0 || str.length > MAX_STRING_LENGTH) {
    return [];
  }

  const zpl = extractZplLabels(str);
  if (zpl.length) {
    return zpl;
  }

  const dataUrl = str.match(DATA_URL_IMAGE_REGEX);
  if (dataUrl) {
    return toImage(dataUrl[1].toLowerCase(), dataUrl[2].replace(/\s/g, ''));
  }

  if (SVG_REGEX.test(str)) {
    return toImage('image/svg+xml', Buffer.from(str, 'utf8').toString('base64'));
  }

  if (str.length < MIN_BASE64_LENGTH || !BASE64_REGEX.test(str)) {
    return [];
  }

  const type = detectContentTypeFromBase64(str);
  if (type === 'application/pdf') {
    return [{ kind: 'pdf', content: str }];
  }
  if (type?.startsWith('image/')) {
    return toImage(type, str.replace(/\s/g, ''));
  }

  return extractZplLabels(Buffer.from(str, 'base64').toString('utf8'));
};

// Decodes entities in one pass so a decoded '&' is never decoded again. Carriage returns are dropped because SOAP
// APIs insert them (as &#13;) into wrapped base64; code points XML cannot represent are dropped too.
const decodeXmlEntities = (text) => text.replace(XML_ENTITY_REGEX, (entity, hex, decimal, name) => {
  if (name) return NAMED_ENTITIES[name];

  const codePoint = hex ? parseInt(hex, 16) : parseInt(decimal, 10);
  const isSurrogate = codePoint >= 0xD800 && codePoint <= 0xDFFF;
  if (codePoint === CARRIAGE_RETURN || codePoint === 0 || codePoint > MAX_CODE_POINT || isSurrogate) return '';
  return String.fromCodePoint(codePoint);
});

// Text content of each XML element, so a base64 label is checked on its own instead of as part of the whole document.
// CDATA is literal, so only ordinary text has its entities decoded.
const extractElementTexts = (markup) => [...markup.matchAll(XML_TEXT_REGEX)]
  .map(([, cdata, text]) => (cdata ?? decodeXmlEntities(text)).trim())
  .filter(Boolean);

const collectStrings = (value, out, budget, depth = 0) => {
  if (budget.nodes <= 0 || depth > MAX_SCAN_DEPTH) {
    return;
  }
  budget.nodes--;

  if (typeof value === 'string') {
    if (value.trimStart().startsWith('<') && !SVG_REGEX.test(value) && value.length <= MAX_STRING_LENGTH) {
      out.push(...extractElementTexts(value));
    } else {
      out.push(value);
    }
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out, budget, depth + 1));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out, budget, depth + 1));
  }
};

/**
 * Detects printable labels (PDF or ZPL) and embedded images, such as a QR code, in a response.
 *
 * Looks at the raw body first (PDF magic bytes) and then at string values inside a parsed JSON body or the
 * element texts of an XML body: plain ZPL, base64-encoded PDF, ZPL or image, data URLs and inline SVG.
 * A response that is itself an image is left to the regular image preview.
 *
 * @param {{ data: any, dataBuffer: string }} response - parsed body and base64 raw body
 * @returns {Array<{ kind: 'pdf' | 'zpl' | 'image', content: string, mime?: string }>} content is base64 for pdf and
 * image (with its mime type), ZPL text for zpl
 */
export const detectLabels = ({ data, dataBuffer } = {}) => {
  const bodyType = dataBuffer ? detectContentTypeFromBase64(dataBuffer) : null;
  if (bodyType === 'application/pdf') {
    return [{ kind: 'pdf', content: dataBuffer }];
  }
  if (bodyType?.startsWith('image/')) {
    return [];
  }

  const strings = [];
  collectStrings(data, strings, { nodes: MAX_SCAN_NODES });

  return strings.flatMap(detectInString);
};
