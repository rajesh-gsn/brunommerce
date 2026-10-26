const MAX_SCAN_NODES = 2000;
const MAX_SCAN_DEPTH = 6;

// ISO-8601 timestamps in UTC, written with a trailing Z or +00:00 offset
const UTC_TIMESTAMP_PATTERN = '(?<![0-9A-Za-z])(\\d{4}-\\d{2}-\\d{2})T(\\d{2}:\\d{2}:\\d{2})(\\.\\d+)?(?:Z|\\+00:00)(?![0-9A-Za-z])';

const createLocalFormatter = (timeZone) => new Intl.DateTimeFormat('en-US', {
  timeZone,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'longOffset'
});

// Local ISO-8601 with the zone's offset at that instant, so daylight saving time is handled by Intl
const formatLocal = (formatter, date, fraction = '') => {
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
  const offset = parts.timeZoneName.replace('GMT', '') || '+00:00';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${fraction}${offset}`;
};

const convertString = (text, formatter) => text.replace(new RegExp(UTC_TIMESTAMP_PATTERN, 'g'), (match, day, time, fraction) => {
  const date = new Date(`${day}T${time}Z`);
  return Number.isNaN(date.getTime()) ? match : formatLocal(formatter, date, fraction);
});

const convertValue = (value, formatter) => {
  if (typeof value === 'string') {
    return convertString(value, formatter);
  }
  if (Array.isArray(value)) {
    return value.map((item) => convertValue(item, formatter));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convertValue(item, formatter)]));
  }
  return value;
};

/**
 * Rewrites UTC timestamps (ISO-8601 with Z or +00:00) as local time with the zone's offset, for display only.
 * Works on text and on parsed JSON values; everything else is returned unchanged.
 *
 * @param {any} value - text, or a JSON-like value whose strings are converted
 * @param {{ timeZone?: string }} [options] - an IANA zone such as 'Asia/Kolkata'; defaults to the system zone
 */
export const convertUtcTimestampsToLocal = (value, { timeZone } = {}) => convertValue(value, createLocalFormatter(timeZone));

/**
 * Whether a response body holds at least one UTC timestamp, scanning a bounded number of values.
 */
export const hasUtcTimestamps = (value) => {
  const pattern = new RegExp(UTC_TIMESTAMP_PATTERN);
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
