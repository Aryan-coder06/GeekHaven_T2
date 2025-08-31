// src/__tests__/seed.test.js
import {
  parseSeedNumber,
  platformFeeBackend,
  skuFrom,
  hmacSignature,
  adminSecretFrom,
  canonicalJSONStringify,
} from '../../src/utils/seed.js';

describe('Seed utilities (HMAC-based v2)', () => {
  const seedA = 'FRONT25-1239';
  const seedB = 'FRONT25-9999';

  test('parseSeedNumber: bounded, deterministic, seed-sensitive', () => {
    const a1 = parseSeedNumber(seedA);
    const a2 = parseSeedNumber(seedA);
    const b1 = parseSeedNumber(seedB);

    // bounds
    expect(a1.asInt).toBeGreaterThanOrEqual(0);
    expect(a1.asInt).toBeLessThan(100);
    expect(a1.asMod10).toBeGreaterThanOrEqual(0);
    expect(a1.asMod10).toBeLessThan(10);

    // deterministic for same seed
    expect(a1).toEqual(a2);

    // likely different for different seeds
    // (not mathematically guaranteed, but very likely)
    expect(`${a1.asInt}:${a1.asMod10}`).not.toEqual(`${b1.asInt}:${b1.asMod10}`);
  });

  test('platformFeeBackend: follows floor(0.017*subtotal + n)', () => {
    const subtotal = 10000; // paise
    const { asMod10 } = parseSeedNumber(seedA);
    const expected = Math.floor(0.017 * subtotal + asMod10);
    expect(platformFeeBackend(subtotal, seedA)).toBe(expected);
  });

  test('skuFrom: format & determinism', () => {
    const id1 = '42';
    const id2 = '507f1f77bcf86cd799439011';

    const s1a = skuFrom(id1, seedA);
    const s1b = skuFrom(id1, seedA);
    const s1c = skuFrom(id1, seedB);

    const s2a = skuFrom(id2, seedA);

    // SKU-<id>-<8 HEX>-<2 digits>
    expect(s1a).toMatch(/^SKU-42-[A-F0-9]{8}-\d{2}$/);
    expect(s2a).toMatch(/^SKU-507f1f77bcf86cd799439011-[A-F0-9]{8}-\d{2}$/);

    // deterministic for same seed & id
    expect(s1a).toBe(s1b);

    // different seed should (almost surely) produce different SKU
    expect(s1a).not.toBe(s1c);
  });

  test('hmacSignature: canonical JSON is order-insensitive', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    const sig1 = hmacSignature(obj1, seedA);
    const sig2 = hmacSignature(obj2, seedA);
    expect(sig1).toBe(sig2);

    // sanity: changing value changes signature
    const sig3 = hmacSignature({ a: 1, b: 3 }, seedA);
    expect(sig3).not.toBe(sig1);
  });

  test('adminSecretFrom: 64-hex, deterministic & seed-sensitive', () => {
    const sA1 = adminSecretFrom(seedA);
    const sA2 = adminSecretFrom(seedA);
    const sB1 = adminSecretFrom(seedB);

    expect(sA1).toMatch(/^[a-f0-9]{64}$/);
    expect(sA1).toBe(sA2);
    expect(sA1).not.toBe(sB1);
  });

  test('canonicalJSONStringify: stable ordering', () => {
    const obj1 = { z: 1, a: { d: 2, c: 3 }, arr: [{ y: 2, x: 1 }] };
    const obj2 = { a: { c: 3, d: 2 }, arr: [{ x: 1, y: 2 }], z: 1 };
    expect(canonicalJSONStringify(obj1)).toBe(canonicalJSONStringify(obj2));
  });
});
