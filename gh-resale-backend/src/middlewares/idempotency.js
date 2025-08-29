// middlewares/idempotency.js
import crypto from 'crypto';
import IdemKey from '../models/idemkey.model.js';

export default async function idempotency(req, res, next) {
  const key = req.header('Idempotency-Key');
  if (!key) return res.status(400).json({ message: 'Missing Idempotency-Key' });

  const endpoint = req.baseUrl + req.path;
  const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  let doc = await IdemKey.findById(key);
  if (doc) {
    if (doc.requestHash !== requestHash || doc.endpoint !== endpoint) {
      return res.status(409).json({ message: 'Idempotency-Key collision' });
    }
    if (doc.responseJson) return res.json(doc.responseJson);
    return next(); // IN_PROGRESS fallthrough
  }

  await IdemKey.create({
    _id: key, endpoint, userId: req.user?.id, requestHash,
    status: 'IN_PROGRESS', expiresAt
  });

  // capture response to store once
  const send = res.send.bind(res);
  res.send = async (body) => {
    try {
      const payload = typeof body === 'string' ? JSON.parse(body) : body;
      await IdemKey.findByIdAndUpdate(key, { status: 'DONE', responseJson: payload });
    } catch {}
    return send(body);
  };

  next();
}
