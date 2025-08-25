import crypto from 'crypto';
import { ENV } from '../config/env.js';

export function parseSeedNumber(seed = ENV.ASSIGNMENT_SEED) {
  const s = String(seed || '');
  const uniquePart = s.includes('-') ? s.split('-').slice(1).join('-') : s;

  const digits = (uniquePart.match(/\d/g) || []).join('');
  if (digits.length) {
    const asInt = parseInt(digits, 10); 
    return { asInt, asMod10: asInt % 10 };
  }

  const h = crypto.createHash('sha256').update(uniquePart).digest('hex').slice(0, 4);
  const asInt = parseInt(h, 16) % 100;
  return { asInt, asMod10: asInt % 10 };
}


export function platformFeeBackend(subtotal, seed = ENV.ASSIGNMENT_SEED) {
  const { asMod10 } = parseSeedNumber(seed);
  const pct = Math.floor(0.017 * subtotal); // 1.7%
  return Math.floor(pct + asMod10);
}

export function skuFrom(listingId, seed = ENV.ASSIGNMENT_SEED) {
  const { asMod10 } = parseSeedNumber(seed);
  const base = `${listingId}${asMod10}`;
  let sum = 0, dbl = false;
  for (let i = base.length - 1; i >= 0; i--) {
    let n = parseInt(base[i], 10);
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n; dbl = !dbl;
  }
  const check = (10 - (sum % 10)) % 10;
  return `LIST-${listingId}-${check}`;
}

export function hmacSignature(obj, seed = ENV.ASSIGNMENT_SEED) {
  const body = JSON.stringify(obj);
  return crypto.createHmac('sha256', seed).update(body).digest('hex');
}

export function adminSecretFrom(seed = ENV.ASSIGNMENT_SEED, jwtSecret = process.env.JWT_SECRET || 'change-me') {
  return crypto.createHash('sha256').update(`${seed}:${jwtSecret}`).digest('hex');
}
