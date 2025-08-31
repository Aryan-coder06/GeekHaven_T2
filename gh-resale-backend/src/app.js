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

app.use(cors());

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(cookieParser());

app.use(requestLogMiddleware);

// routes
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
