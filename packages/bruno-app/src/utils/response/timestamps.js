const MAX_SCAN_NODES = 2000;
const MAX_SCAN_DEPTH = 6;

// ISO-8601 date-times with an explicit offset: 2026-10-26T06:30:00Z, ...00.250+05:30, ...00+0530
const ISO_TIMESTAMP_PATTERN = '(?<![0-9A-Za-z])\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})(?![0-9A-Za-z])';

const RELATIVE_UNITS = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
];

const parseIso = (text) => {
  // +0530 is valid ISO-8601 but not accepted by every Date parser
  const date = new Date(text.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Whether a response body holds at least one ISO-8601 timestamp with an offset, scanning a bounded number of values.
 */
export const hasTimestamps = (value) => {
  const pattern = new RegExp(ISO_TIMESTAMP_PATTERN);
  let remaining = MAX_SCAN_NODES;

  const scan = (node, depth) => {
    if (remaining <= 0 || depth > MAX_SCAN_DEPTH) return false;
    remaining--;

    if (typeof node === 'string') return pattern.test(node);
    if (Array.isArray(node)) return node.some((item) => scan(item, depth + 1));
    if (node && typeof node === 'object') return Object.values(node).some((item) => scan(item, depth + 1));
    return false;
  };

  return scan(value, 0);
};

/**
 * Finds the ISO-8601 timestamps with an offset in a piece of text, skipping impossible dates.
 *
 * @returns {Array<{ index: number, length: number, date: Date }>}
 */
export const findTimestamps = (text) => [...text.matchAll(new RegExp(ISO_TIMESTAMP_PATTERN, 'g'))]
  .map((match) => ({ index: match.index, length: match[0].length, date: parseIso(match[0]) }))
  .filter(({ date }) => date !== null);

const formatRelative = (date, now) => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const [unit, size] = RELATIVE_UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ['second', 1];
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'narrow' }).format(Math.trunc(seconds / size), unit);
};

/**
 * Text for the chip shown after a timestamp: the instant in a zone with its offset, then how long ago or from now,
 * for example "27 Oct 02:15:00 +05:30 · in 5h". Without a zone the system zone is used.
 */
export const formatChip = (date, { timeZone, now = new Date() } = {}) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset'
  }).formatToParts(date).map(({ type, value }) => [type, value]));

  const offset = parts.timeZoneName.replace('GMT', '') || '+00:00';
  return `${parts.day} ${parts.month} ${parts.hour}:${parts.minute}:${parts.second} ${offset} · ${formatRelative(date, now)}`;
};
