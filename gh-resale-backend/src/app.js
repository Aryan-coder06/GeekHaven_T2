// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import compression from 'compression';
// import cookieParser from 'cookie-parser';

// import { ENV } from './config/env.js';
// import specialRoutes from './routes/special.js';
// import { requestLogMiddleware } from './middlewares/requestLog.js';
// import { errorHandler } from './middlewares/error.js';

// import authRoutes from './modules/auth/auth.routes.js';
// import userRoutes from './modules/user/user.routes.js';

// import listingsRouter from './routes/listings.route.js';
// import favoritesRouter from './routes/favorites.route.js';
// import checkoutRouter from './routes/checkout.route.js';
// import cartRouter from './routes/cart.route.js';


// const app = express();

// app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
// app.use(helmet());
// app.use(compression());
// app.use(express.json({ limit: '1mb' }));
// app.use(morgan('tiny'));
// app.use(cookieParser());

// app.use(requestLogMiddleware);

// // routes
// app.use('/', specialRoutes);

// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);

// app.use('/listings', listingsRouter);
// app.use('/favorites', favoritesRouter);
// app.use('/checkout', checkoutRouter);
// app.use('/cart', cartRouter);


// app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// app.use(errorHandler);

// export default app;
// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { ENV } from './config/env.js';
import specialRoutes from './routes/special.js';
import { requestLogMiddleware } from './middlewares/requestLog.js';
import { errorHandler } from './middlewares/error.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import listingsRouter from './routes/listings.route.js';
import favoritesRouter from './routes/favorites.route.js';
import checkoutRouter from './routes/checkout.route.js';
import cartRouter from './routes/cart.route.js';

const app = express();
const raw = (ENV.CORS_ORIGIN || process.env.CORS_ORIGIN || '').trim();
const ALLOWLIST = new Set(
  raw.split(',').map(s => s.trim()).filter(Boolean)
);
if (ENV.NODE_ENV !== 'production') {
  ['http://localhost:8080','http://127.0.0.1:8080'].forEach(o => ALLOWLIST.add(o));
}
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWLIST.has(origin)) return cb(null, true);
    cb(new Error(`CORS: Origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Idempotency-Key'],
  exposedHeaders: ['X-Signature','X-Idempotent-Replay'],
};

app.use((req,res,next)=>{ res.header('Vary','Origin'); next(); });
app.use(cors(corsOptions));

app.set('trust proxy', 1);                       
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(ENV.NODE_ENV === 'production' ? 'tiny' : 'dev'));

app.use(requestLogMiddleware);

app.use('/', specialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use('/listings', listingsRouter);
app.use('/favorites', favoritesRouter);
app.use('/checkout', checkoutRouter);
app.use('/cart', cartRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
