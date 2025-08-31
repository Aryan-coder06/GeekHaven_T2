// // seed.js
// import crypto from 'crypto';
// import { ENV } from '../config/env.js';

// function canonicalJSONStringify(obj) {
//   const seen = new WeakSet();
//   const sorter = (value) => {
//     if (value && typeof value === 'object') {
//       if (seen.has(value)) throw new TypeError('Circular structure in payload');
//       seen.add(value);

//       if (Array.isArray(value)) return value.map(sorter);

//       // sort object keys
//       return Object.keys(value).sort().reduce((acc, k) => {
//         acc[k] = sorter(value[k]);
//         return acc;
//       }, {});
//     }
//     return value;
//   };
//   return JSON.stringify(sorter(obj));
// }

// /**
//  * Derive a couple of small integers from the FULL seed (not just digits).
//  * - n10: 0..9  (for the fee formula)
//  * - n100: 0..99 (available if you need a two-digit salt elsewhere)
//  */
// export function parseSeedNumber(seed = ENV.ASSIGNMENT_SEED) {
//   const s = String(seed ?? '');

//   // Use HMAC with a fixed key to avoid short/structured seeds being weak
//   const h = crypto
//     .createHmac('sha256', 'ASSIGNMENT_SEED_DERIVATION_V1')
//     .update(s)
//     .digest(); // Buffer

//   const n10 = h[0] % 10;
//   const n100 = ((h[0] << 8) | h[1]) % 100;

//   return { asInt: n100, asMod10: n10 };
// }

// /**
//  * platformFeeBackend:
//  * spec: floor( 1.7% of subtotal + n ) where n comes from the seed
//  * We compute exactly floor(0.017 * subtotal + n).
//  */
// export function platformFeeBackend(subtotal, seed = ENV.ASSIGNMENT_SEED) {
//   const { asMod10 } = parseSeedNumber(seed);
//   return Math.floor(0.017 * Number(subtotal) + asMod10);
// }

// /**
//  * skuFrom:
//  * Produce a deterministic SKU using the FULL seed.
//  * Format: SKU-<listingId>-<chk8>-<cd>
//  * - chk8: first 8 hex chars of HMAC-SHA256(seed, listingId)
//  * - cd:   2-digit mod97 check (on "listingId+chk8"), for typo detection
//  */
// export function skuFrom(listingId, seed = ENV.ASSIGNMENT_SEED) {
//   const idStr = String(listingId);

//   const macHex = crypto
//     .createHmac('sha256', String(seed))
//     .update(idStr)
//     .digest('hex');

//   const chk8 = macHex.slice(0, 8).toUpperCase();

//   // Simple numeric check digits (ISO-7064-like vibe): mod 97 of ASCII codes
//   // deterministic and cheap; helps reject accidental typos in support flows
//   const numericStr = Buffer.from(idStr + chk8, 'utf8').reduce((acc, b) => acc + String(b), '');
//   const cd = String(Number(numericStr) % 97).padStart(2, '0');

//   return `SKU-${idStr}-${chk8}-${cd}`;
// }

// /**
//  * hmacSignature:
//  * HMAC-SHA256 over a CANONICAL JSON string of the response body using FULL seed.
//  * This ensures the same signature regardless of key insertion order.
//  * Header: X-Signature: <hex>
//  */
// export function hmacSignature(obj, seed = ENV.ASSIGNMENT_SEED) {
//   const body = canonicalJSONStringify(obj);
//   return crypto.createHmac('sha256', String(seed)).update(body).digest('hex');
// }

// /**
//  * adminSecretFrom:
//  * Derive the ADMIN JWT signing secret from the FULL seed.
//  * (You use this value as the JWT secret for admin tokens only.)
//  */
// export function adminSecretFrom(seed = ENV.ASSIGNMENT_SEED) {
//   return crypto.createHash('sha256').update(String(seed)).digest('hex');
// }

// export { canonicalJSONStringify };


// backend/src/utils/seed.js
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////














// backend/src/utils/seed.js
import crypto from 'crypto';
import { ENV } from '../config/env.js';

function canonicalJSONStringify(obj) {
  const seen = new WeakSet();
  const sortDeep = (value) => {
    if (value && typeof value === 'object') {
      if (seen.has(value)) throw new TypeError('Circular structure in payload');
      seen.add(value);
      if (Array.isArray(value)) return value.map(sortDeep);
      return Object.keys(value).sort().reduce((acc, k) => {
        acc[k] = sortDeep(value[k]);
        return acc;
      }, {});
    }
    return value;
  };
  return JSON.stringify(sortDeep(obj));
}

/** Legacy derivation kept for compatibility */
export function parseSeedNumber(seed = ENV.ASSIGNMENT_SEED) {
  const s = String(seed ?? '');
  const h = crypto.createHmac('sha256', 'ASSIGNMENT_SEED_DERIVATION_V1').update(s).digest();
  const n10 = h[0] % 10;
  const n100 = ((h[0] << 8) | h[1]) % 100;
  return { asInt: n100, asMod10: n10 };
}

/** Match the frontend digit extraction (digits only; default 25) */
export function getSeedNumberDigits(seed = ENV.ASSIGNMENT_SEED) {
  const m = String(seed ?? '').match(/\d+/g);
  return m ? parseInt(m.join(''), 10) : 25;
}

/** Assignment rule: fee = (seed_number % 10)% of subtotal (subtotal in MAJOR units) */
export function platformFeeBackend(subtotalMajor, seed = ENV.ASSIGNMENT_SEED) {
  const seedNum = getSeedNumberDigits(seed);
  const pct = seedNum % 10;
  return (Number(subtotalMajor) * pct) / 100;
}

/** Deterministic SKU based on seed */
export function skuFrom(listingId, seed = ENV.ASSIGNMENT_SEED) {
  const idStr = String(listingId);
  const macHex = crypto.createHmac('sha256', String(seed)).update(idStr).digest('hex');
  const chk8 = macHex.slice(0, 8).toUpperCase();
  const numericStr = Buffer.from(idStr + chk8, 'utf8').reduce((acc, b) => acc + String(b), '');
  const cd = String(Number(numericStr) % 97).padStart(2, '0');
  return `SKU-${idStr}-${chk8}-${cd}`;
}

/** Sign the CANONICAL JSON of the response using the full seed */
export function hmacSignature(obj, seed = ENV.ASSIGNMENT_SEED) {
  const body = canonicalJSONStringify(obj);
  return crypto.createHmac('sha256', String(seed)).update(body).digest('hex');
}

/** Optional: derive an admin secret from the full seed */
export function adminSecretFrom(seed = ENV.ASSIGNMENT_SEED) {
  return crypto.createHash('sha256').update(String(seed)).digest('hex');
}

export { canonicalJSONStringify };
