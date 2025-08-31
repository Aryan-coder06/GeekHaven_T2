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

// app.use(cors());

// const app = express();


// app.use(helmet());
// app.use(compression());
// app.use(express.json({ limit: '1mb' }));
// app.use(morgan('tiny'));
// app.use(cookieParser());
// app.set('trust proxy', 1);

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

app.set('trust proxy', 1);

const RAW_ORIGINS = ENV.CORS_ORIGIN || process.env.CORS_ORIGIN || '';
const ALLOWLIST = RAW_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWLIST.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  exposedHeaders: ['X-Signature', 'X-Idempotent-Replay'],
};

app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  next();
});

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));





app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(cookieParser());

app.use(requestLogMiddleware);

// ----- Routes -----
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
