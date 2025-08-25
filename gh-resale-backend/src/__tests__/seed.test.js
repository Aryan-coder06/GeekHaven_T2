import { parseSeedNumber, platformFeeBackend, skuFrom, hmacSignature, adminSecretFrom } from '../utils/seed.js';

describe('Seed utilities', () => {
  const seed = 'GHW25-1239';

  test('parseSeedNumber', () => {
    const n = parseSeedNumber(seed);
    expect(n.asInt).toBe(1239);
    expect(n.asMod10).toBe(9);
  });

  test('platformFeeBackend', () => {
    expect(platformFeeBackend(10000, seed)).toBe(Math.floor(0.017 * 10000) + 9);
  });

  test('skuFrom checksum', () => {
    expect(skuFrom(42, seed)).toMatch(/^LIST-42-\d$/);
  });

  test('hmacSignature stable', () => {
    const a = hmacSignature({ ok: true }, seed);
    const b = hmacSignature({ ok: true }, seed);
    expect(a).toBe(b);
  });

  test('adminSecretFrom derived', () => {
    const a = adminSecretFrom(seed, 'X');
    const b = adminSecretFrom(seed, 'X');
    const c = adminSecretFrom(seed, 'Y');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
