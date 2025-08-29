import { Router } from 'express';
import { ENV } from '../config/env.js';

const router = Router();

router.get('/', (req,res) => {
  res.json({ok:true , message: "Working"});
})


router.get(`/${ENV.ROLLNO}/healthz`, (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

router.get('/logs/recent', (req, res) => {
  res.json({ logs: req._recentLogs || [] });
});

export default router;
