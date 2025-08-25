import crypto from 'crypto';

const RING = [];
const LIMIT = 50;

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  const mask = (s) => (typeof s === 'string' ? s.replace(/[^@]+@[^@]+/g, '***@***') : s);
  const walk = (o) => {
    for (const k of Object.keys(o)) {
      if (['password', 'token', 'authorization'].includes(k.toLowerCase())) {
        o[k] = '***';
      } else if (typeof o[k] === 'object' && o[k] !== null) {
        walk(o[k]);
      } else if (typeof o[k] === 'string') {
        o[k] = mask(o[k]);
      }
    }
  };
  walk(clone);
  return clone;
}

export function requestLogMiddleware(req, res, next) {
  const entry = {
    method: req.method,
    path: req.path,
    ipHash: req.ip ? crypto.createHash('sha256').update(req.ip).digest('hex').slice(0, 16) : null,
    redactedBody: redact(req.body),
    createdAt: new Date().toISOString(),
  };
  RING.push(entry);
  if (RING.length > LIMIT) RING.shift();
  req._recentLogs = RING; // used by /logs/recent
  next();
}
