import { describe, it, expect } from 'vitest';
import { decodeUlidTime, decodeUuidV7Time, detectIdKind } from '../src/lib/ulid';

describe('id decoding', () => {
  it('decodes ULID timestamp', () => {
    const ms = Date.UTC(2024, 5, 5);
    const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let t = ms, enc = '';
    for (let i = 0; i < 10; i++) { enc = ALPHA[t % 32] + enc; t = Math.floor(t / 32); }
    expect(decodeUlidTime(enc + '0'.repeat(16))).toBe(ms);
  });
  it('decodes UUIDv7 timestamp', () => {
    expect(decodeUuidV7Time('018fe5b2-0400-7000-8000-000000000000')).toBe(Date.UTC(2024, 5, 5));
  });
  it('detects kinds', () => {
    expect(detectIdKind('018fe8a2-e400-7000-8000-000000000000')).toBe('uuidv7');
    expect(detectIdKind('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe('uuidv4');
    expect(detectIdKind('01HZ8N5VJT5W5K6J0Q4R8XLMNO'.replace('L','A').replace('O','B'))).toBe('ulid');
    expect(detectIdKind('hello')).toBe('unknown');
  });
});
