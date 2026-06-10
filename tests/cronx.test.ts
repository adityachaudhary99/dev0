import { describe, it, expect } from 'vitest';
import { nextRunsTz, normalizeExpr } from '../src/lib/cronx';

describe('cronx', () => {
  it('expands @daily', () => expect(normalizeExpr('@daily')).toBe('0 0 * * *'));
  it('passes through 5-field', () => expect(normalizeExpr('*/5 * * * *')).toBe('*/5 * * * *'));
  it('computes next runs in a timezone', () => {
    const runs = nextRunsTz('0 9 * * *', 3, 'Asia/Kolkata');
    expect(runs).toHaveLength(3);
    for (const r of runs) {
      // hour string may be '9' or '09' depending on the ICU build — compare numerically
      const h = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(r);
      expect(Number(h)).toBe(9);
    }
  });
  it('handles 6-field (seconds)', () => {
    expect(nextRunsTz('30 * * * * *', 2, 'UTC')).toHaveLength(2);
  });
  it('handles sparse Feb-29', () => {
    const runs = nextRunsTz('0 0 29 2 *', 1, 'UTC');
    expect(runs[0]!.getUTCDate()).toBe(29);
  });
});
