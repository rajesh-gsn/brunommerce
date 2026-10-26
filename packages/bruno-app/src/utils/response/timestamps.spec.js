import { findTimestamps, formatChip, hasTimestamps } from './timestamps';

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

describe('findTimestamps', () => {
  it('returns each timestamp with its position and instant', () => {
    const text = '{"a": "2026-10-26T06:30:00Z", "b": "2026-10-26T12:00:00+05:30"}';
    const found = findTimestamps(text);

    expect(found.map(({ index, length }) => text.slice(index, index + length))).toEqual(['2026-10-26T06:30:00Z', '2026-10-26T12:00:00+05:30']);
    expect(found.map(({ date }) => date.toISOString())).toEqual(['2026-10-26T06:30:00.000Z', '2026-10-26T06:30:00.000Z']);
  });

  it('reads an offset written without a colon', () => {
    expect(findTimestamps('2026-10-26T12:00:00+0530')[0].date.toISOString()).toBe('2026-10-26T06:30:00.000Z');
  });

  it('skips impossible dates, dates without an offset and timestamps glued to other characters', () => {
    expect(findTimestamps('2026-13-45T06:30:00Z 2026-10-26T06:30:00 id2026-10-26T06:30:00Zabc')).toEqual([]);
  });
});

describe('formatChip', () => {
  const now = new Date('2026-10-26T12:00:00Z');

  it('shows the instant in the zone with its offset and a short relative time', () => {
    expect(formatChip(new Date('2026-10-26T20:45:00Z'), { timeZone: 'Asia/Kolkata', now })).toBe('27 Oct 02:15:00 +05:30 · in 8h');
  });

  it('writes a zero offset explicitly', () => {
    expect(formatChip(new Date('2026-10-26T06:30:00Z'), { timeZone: 'UTC', now })).toBe('26 Oct 06:30:00 +00:00 · 5h ago');
  });

  it('uses the offset in force at that instant, across daylight saving time', () => {
    expect(formatChip(new Date('2026-01-15T12:00:00Z'), { timeZone: 'America/New_York', now })).toContain('15 Jan 07:00:00 -05:00 · ');
    expect(formatChip(new Date('2026-07-15T12:00:00Z'), { timeZone: 'America/New_York', now })).toContain('15 Jul 08:00:00 -04:00 · ');
  });

  it('picks a sensible relative unit in the past and the future', () => {
    const relative = (iso) => formatChip(new Date(iso), { timeZone: 'UTC', now }).split(' · ')[1];
    expect(relative('2026-10-26T11:59:30Z')).toBe('30s ago');
    expect(relative('2026-10-26T12:00:00Z')).toBe('now');
    expect(relative('2026-10-26T12:05:00Z')).toBe('in 5m');
    expect(relative('2026-10-29T12:00:00Z')).toBe('in 3d');
  });
});
