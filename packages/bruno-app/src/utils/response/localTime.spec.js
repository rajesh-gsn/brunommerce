import { convertUtcTimestampsToLocal, hasUtcTimestamps } from './localTime';

const KOLKATA = { timeZone: 'Asia/Kolkata' };

describe('convertUtcTimestampsToLocal', () => {
  it('shifts a UTC timestamp to the zone offset', () => {
    expect(convertUtcTimestampsToLocal('2026-10-26T06:30:00Z', KOLKATA)).toBe('2026-10-26T12:00:00+05:30');
  });

  it('keeps fractional seconds and accepts a +00:00 offset', () => {
    expect(convertUtcTimestampsToLocal('2026-10-26T06:30:00.123456+00:00', KOLKATA)).toBe('2026-10-26T12:00:00.123456+05:30');
  });

  it('crosses midnight into the next day', () => {
    expect(convertUtcTimestampsToLocal('2026-10-26T20:00:00Z', KOLKATA)).toBe('2026-10-27T01:30:00+05:30');
  });

  it('uses the offset in force at that instant, across daylight saving time', () => {
    const newYork = { timeZone: 'America/New_York' };
    expect(convertUtcTimestampsToLocal('2026-01-15T12:00:00Z', newYork)).toBe('2026-01-15T07:00:00-05:00');
    expect(convertUtcTimestampsToLocal('2026-07-15T12:00:00Z', newYork)).toBe('2026-07-15T08:00:00-04:00');
  });

  it('writes a zero offset explicitly for UTC', () => {
    expect(convertUtcTimestampsToLocal('2026-10-26T06:30:00Z', { timeZone: 'UTC' })).toBe('2026-10-26T06:30:00+00:00');
  });

  it('rewrites timestamps inside JSON text and leaves the rest alone', () => {
    const text = '{\n  "createdAt": "2026-10-26T06:30:00Z",\n  "id": 7,\n  "note": "due 2026-10-26"\n}';
    expect(convertUtcTimestampsToLocal(text, KOLKATA)).toBe('{\n  "createdAt": "2026-10-26T12:00:00+05:30",\n  "id": 7,\n  "note": "due 2026-10-26"\n}');
  });

  it('converts every timestamp in a parsed value without changing its shape', () => {
    const data = { events: [{ at: '2026-10-26T06:30:00Z', ok: true }], count: 1, none: null };
    expect(convertUtcTimestampsToLocal(data, KOLKATA)).toEqual({ events: [{ at: '2026-10-26T12:00:00+05:30', ok: true }], count: 1, none: null });
    expect(data.events[0].at).toBe('2026-10-26T06:30:00Z');
  });

  it('leaves timestamps with other offsets, epoch numbers and impossible dates unchanged', () => {
    const data = { a: '2026-10-26T06:30:00+02:00', b: 1793000000000, c: '2026-13-45T06:30:00Z', d: '2026-10-26T06:30:00' };
    expect(convertUtcTimestampsToLocal(data, KOLKATA)).toEqual(data);
  });

  it('does not touch a timestamp glued to other word characters', () => {
    expect(convertUtcTimestampsToLocal('id2026-10-26T06:30:00Zabc', KOLKATA)).toBe('id2026-10-26T06:30:00Zabc');
  });
});

describe('hasUtcTimestamps', () => {
  it('finds a timestamp in text and nested values', () => {
    expect(hasUtcTimestamps('created 2026-10-26T06:30:00Z')).toBe(true);
    expect(hasUtcTimestamps({ a: [{ b: '2026-10-26T06:30:00.5Z' }] })).toBe(true);
  });

  it('is false when there is none', () => {
    expect(hasUtcTimestamps({ a: '2026-10-26', b: 5, c: '2026-10-26T06:30:00+02:00' })).toBe(false);
    expect(hasUtcTimestamps(undefined)).toBe(false);
  });
});
