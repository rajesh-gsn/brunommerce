import { formatInZone, formatRelative, getTimeZones, hasTimestamps, modernZoneName, parseTimestamp } from './timestamps';

describe('hasTimestamps', () => {
  it('finds ISO timestamps with any offset, in text and nested values', () => {
    expect(hasTimestamps('created 2026-10-26T06:30:00Z')).toBe(true);
    expect(hasTimestamps({ a: [{ b: '2026-10-26T06:30:00.5+02:00' }] })).toBe(true);
    expect(hasTimestamps('2026-10-26T06:30:00+0530')).toBe(true);
  });

  it('is false for dates without a time or offset, numbers and nothing', () => {
    expect(hasTimestamps({ a: '2026-10-26', b: 1793000000000, c: '2026-10-26T06:30:00' })).toBe(false);
    expect(hasTimestamps(undefined)).toBe(false);
  });
});

describe('parseTimestamp', () => {
  it('reads an ISO timestamp from a quoted value or a whole line', () => {
    expect(parseTimestamp('"2026-10-26T06:30:00Z"').date.toISOString()).toBe('2026-10-26T06:30:00.000Z');
    expect(parseTimestamp('  "createdAt": "2026-10-26T06:30:00Z",').date.toISOString()).toBe('2026-10-26T06:30:00.000Z');
  });

  it('applies the offset in the text', () => {
    expect(parseTimestamp('2026-10-26T12:00:00+05:30').date.toISOString()).toBe('2026-10-26T06:30:00.000Z');
    expect(parseTimestamp('2026-10-26T12:00:00+0530').date.toISOString()).toBe('2026-10-26T06:30:00.000Z');
  });

  it('reads epoch seconds and milliseconds only when the whole selection is that number', () => {
    expect(parseTimestamp('1793000000').date.toISOString()).toBe('2026-10-26T07:33:20.000Z');
    expect(parseTimestamp('1793000000000').date.toISOString()).toBe('2026-10-26T07:33:20.000Z');
    expect(parseTimestamp('order 1793000000000')).toBeNull();
    expect(parseTimestamp('12345')).toBeNull();
  });

  it('returns null for anything else, including impossible dates', () => {
    expect(parseTimestamp('hello')).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp(undefined)).toBeNull();
    expect(parseTimestamp('2026-13-45T06:30:00Z')).toBeNull();
  });
});

describe('formatInZone', () => {
  const instant = new Date('2026-10-26T06:30:00Z');

  it('formats the instant in the given zone with its offset', () => {
    expect(formatInZone(instant, 'Asia/Kolkata')).toBe('Mon 26 Oct 2026, 12:00:00 (UTC+05:30)');
    expect(formatInZone(instant, 'UTC')).toBe('Mon 26 Oct 2026, 06:30:00 (UTC+00:00)');
  });

  it('uses the offset in force at that instant, across daylight saving time', () => {
    expect(formatInZone(new Date('2026-01-15T12:00:00Z'), 'America/New_York')).toBe('Thu 15 Jan 2026, 07:00:00 (UTC-05:00)');
    expect(formatInZone(new Date('2026-07-15T12:00:00Z'), 'America/New_York')).toBe('Wed 15 Jul 2026, 08:00:00 (UTC-04:00)');
  });

  it('rolls into the next day', () => {
    expect(formatInZone(new Date('2026-10-26T20:00:00Z'), 'Asia/Kolkata')).toBe('Tue 27 Oct 2026, 01:30:00 (UTC+05:30)');
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-10-26T12:00:00Z');

  it('picks a sensible unit in the past and the future', () => {
    expect(formatRelative(new Date('2026-10-26T10:00:00Z'), now)).toBe('2 hours ago');
    expect(formatRelative(new Date('2026-10-26T11:59:30Z'), now)).toBe('30 seconds ago');
    expect(formatRelative(new Date('2026-10-29T12:00:00Z'), now)).toBe('in 3 days');
    expect(formatRelative(new Date('2026-10-26T12:00:00Z'), now)).toBe('now');
  });
});

describe('getTimeZones', () => {
  it('lists UTC first and then the IANA zones once, under their current names', () => {
    const zones = getTimeZones();
    expect(zones[0]).toBe('UTC');
    expect(zones).toContain('Asia/Kolkata');
    expect(zones).not.toContain('Asia/Calcutta');
    expect(zones.filter((zone) => zone === 'UTC')).toHaveLength(1);
    expect(new Set(zones).size).toBe(zones.length);
  });
});

describe('modernZoneName', () => {
  it('maps older names to the current ones and leaves other zones alone', () => {
    expect(modernZoneName('Asia/Calcutta')).toBe('Asia/Kolkata');
    expect(modernZoneName('Europe/Kiev')).toBe('Europe/Kyiv');
    expect(modernZoneName('America/New_York')).toBe('America/New_York');
  });
});
