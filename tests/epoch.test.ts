import { describe, it, expect } from 'vitest';
import { parseTimestampInput } from '../src/lib/epoch';

describe('parseTimestampInput', () => {
  it('detects seconds (10 digits)', () => {
    expect(parseTimestampInput('1717600000')).toEqual({ ms: 1717600000_000, unit: 's' });
  });
  it('detects milliseconds (13 digits)', () => {
    expect(parseTimestampInput('1717600000123')).toEqual({ ms: 1717600000123, unit: 'ms' });
  });
  it('detects microseconds (16 digits)', () => {
    expect(parseTimestampInput('1717600000123456')).toEqual({ ms: 1717600000123.456, unit: 'µs' });
  });
  it('parses ISO strings', () => {
    expect(parseTimestampInput('2024-06-05T16:26:40Z')).toEqual({ ms: 1717604800000, unit: 'iso' });
  });
  it('parses loose date strings via Date.parse', () => {
    expect(parseTimestampInput('Jun 5 2024 UTC')?.unit).toBe('date');
  });
  it('rejects garbage', () => {
    expect(parseTimestampInput('not a time')).toBeNull();
    expect(parseTimestampInput('')).toBeNull();
  });
  it('handles negative epochs (pre-1970)', () => {
    expect(parseTimestampInput('-1000000')).toEqual({ ms: -1000000_000, unit: 's' });
  });
});
