const MAX_SCAN_NODES = 2000;
const MAX_SCAN_DEPTH = 6;

// ISO-8601 date-times with an explicit offset: 2026-10-26T06:30:00Z, ...00.250+05:30, ...00+0530
const ISO_TIMESTAMP_PATTERN = '(?<![0-9A-Za-z])\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})(?![0-9A-Za-z])';

const EPOCH_SECONDS = /^\d{10}$/;
const EPOCH_MILLISECONDS = /^\d{13}$/;

const RELATIVE_UNITS = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
];

const isValid = (date) => !Number.isNaN(date.getTime());

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
 * Reads the first timestamp out of a piece of selected text: an ISO-8601 timestamp with an offset,
 * or, when the whole selection is a number, epoch seconds (10 digits) or milliseconds (13 digits).
 *
 * @returns {{ text: string, date: Date } | null}
 */
export const parseTimestamp = (selection) => {
  const trimmed = String(selection ?? '').trim().replace(/^["']|["']$/g, '');

  const iso = trimmed.match(new RegExp(ISO_TIMESTAMP_PATTERN));
  if (iso) {
    // +0530 is valid ISO-8601 but not accepted by every Date parser
    const normalised = iso[0].replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
    const date = new Date(normalised);
    return isValid(date) ? { text: iso[0], date } : null;
  }

  if (EPOCH_SECONDS.test(trimmed) || EPOCH_MILLISECONDS.test(trimmed)) {
    const date = new Date(EPOCH_MILLISECONDS.test(trimmed) ? Number(trimmed) : Number(trimmed) * 1000);
    return isValid(date) ? { text: trimmed, date } : null;
  }

  return null;
};

/**
 * Formats an instant in an IANA zone, for example "Mon 26 Oct 2026, 12:00:00 (UTC+05:30)".
 * Without a zone the system zone is used.
 */
export const formatInZone = (date, timeZone) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset'
  }).formatToParts(date).map(({ type, value }) => [type, value]));

  const offset = parts.timeZoneName.replace('GMT', '') || '+00:00';
  return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second} (UTC${offset})`;
};

/**
 * Describes an instant relative to now, for example "2 hours ago" or "in 3 days".
 */
export const formatRelative = (date, now = new Date()) => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const [unit, size] = RELATIVE_UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ['second', 1];
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.trunc(seconds / size), unit);
};

// Intl reports some zones under their older names; these are the current names people look for
const MODERN_ZONE_NAMES = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Europe/Kiev': 'Europe/Kyiv'
};

/**
 * The current name of a zone, for showing to people; the old and new names are the same zone to Intl.
 */
export const modernZoneName = (zone) => MODERN_ZONE_NAMES[zone] ?? zone;

/**
 * The IANA zones a user can pick, with UTC first.
 */
export const getTimeZones = () => {
  const zones = new Set(Intl.supportedValuesOf('timeZone').map(modernZoneName));
  zones.delete('UTC');
  return ['UTC', ...[...zones].sort()];
};
