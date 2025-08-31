import crypto from 'crypto';
import IdemKey from '../models/idemkey.model.js';

function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']';
  return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}';
}

export default async function idempotency(req, res, next) {
  try {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

    const key = req.header('Idempotency-Key');
    if (!key) return res.status(400).json({ message: 'Missing Idempotency-Key' });

    const endpoint = req.baseUrl + req.path;                    // stable endpoint id
    const material = req.method + ' ' + endpoint + ' ' + canonicalStringify(req.body || {});
    const requestHash = crypto.createHash('sha256').update(material).digest('hex');

    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000);

    let doc = await IdemKey.findById(key).lean();

    if (doc) {
      if (doc.requestHash !== requestHash || doc.endpoint !== endpoint) {
        return res.status(409).json({ message: 'Idempotency-Key collision' });
      }
      if (doc.responseJson != null) {
        res.set('X-Idempotent-Replay', '1');
        return res.json(doc.responseJson);
      }
      return next();
    }

    await IdemKey.create({
      _id: key,
      endpoint,
      userId: req.user?._id ?? null,
      requestHash,
      status: 'IN_PROGRESS',
      expiresAt,
    });

    const _json = res.json.bind(res);
    const _send = res.send.bind(res);

    const persist = async (payload) => {
      try {
        let toStore = payload;
        if (typeof payload === 'string') {
          try { toStore = JSON.parse(payload); } catch { /* leave as string */ }
        }
        await IdemKey.findByIdAndUpdate(key, { status: 'DONE', responseJson: toStore }).lean();
      } catch (e) {
        console.warn('Idempotency persist warn:', e?.message || e);
      }
    };

    res.json = async function (obj) { await persist(obj); return _json(obj); };
    res.send = async function (body) { await persist(body); return _send(body); };

    next();
  } catch (e) {
    next(e);
  }
}
