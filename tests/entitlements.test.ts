import { describe, it, expect } from 'vitest';
import { webcrypto } from 'node:crypto';
import { verifyLicenseKey } from '../src/lib/entitlements';

const subtle = webcrypto.subtle;
const b64u = (b: ArrayBuffer | Uint8Array) => Buffer.from(b as Uint8Array).toString('base64url');

async function makeKey(payload: object, tamper = false) {
  const { publicKey, privateKey } = await subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, bytes);
  const key = `0LK1.${b64u(bytes)}.${b64u(tamper ? new Uint8Array(64) : sig)}`;
  return { key, jwk: await subtle.exportKey('jwk', publicKey) as JsonWebKey };
}

const valid = { v: 1, email: 'a@b.c', plan: 'pro', hubs: ['*'], iat: 1, exp: null };

describe('verifyLicenseKey', () => {
  it('accepts a valid wildcard license', async () => {
    const { key, jwk } = await makeKey(valid);
    expect((await verifyLicenseKey(key, jwk))?.email).toBe('a@b.c');
  });
  it('rejects a tampered signature', async () => {
    const { key, jwk } = await makeKey(valid, true);
    expect(await verifyLicenseKey(key, jwk)).toBeNull();
  });
  it('rejects expired licenses', async () => {
    const { key, jwk } = await makeKey({ ...valid, exp: 1 });
    expect(await verifyLicenseKey(key, jwk)).toBeNull();
  });
  it('rejects licenses for other hubs', async () => {
    const { key, jwk } = await makeKey({ ...valid, hubs: ['ai0'] });
    expect(await verifyLicenseKey(key, jwk)).toBeNull();
  });
  it('rejects garbage', async () => {
    expect(await verifyLicenseKey('not.a.key')).toBeNull();
  });
});
