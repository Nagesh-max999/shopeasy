// The Express app, shared by the normal server (server.js) and the Vercel function (api/index.js).
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

// Local settings live in server/.env (works whichever folder the server is started from);
// on a hosting platform the variables come from its dashboard instead.
dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

// Hosting platforms name the database variable differently (e.g. Railway's MongoDB uses MONGO_URL)
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

export function configError() {
  if (!MONGO_URI) return 'Missing MONGO_URI: set it in server/.env or in your hosting environment.';
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)
    return 'Missing or short JWT_SECRET: set a long random string in server/.env or your hosting environment.';
  return null;
}

// Reuses one connection across requests (important on serverless, where the module stays warm)
let connecting;
export function connectDB() {
  connecting ??= mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 }).catch((err) => {
    connecting = undefined; // let the next request retry
    throw err;
  });
  return connecting;
}

export function createApp({ serveClient = false } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

  // Serve the built React site (client/dist) from the same server when it exists,
  // so the whole store can run as one service on one URL.
  const clientDist = fileURLToPath(new URL('../client/dist', import.meta.url));
  if (serveClient && existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    // Any other path is a page in the React app (e.g. /cart, /product/123)
    app.get('*', (req, res) => res.sendFile('index.html', { root: clientDist }));
  }

  // Central error handler
  app.use((err, req, res, next) => {
    console.error(err.message);
    let status = err.status || 500;
    if (err.name === 'CastError') status = 404;
    if (err.name === 'ValidationError') status = 400;
    res.status(status).json({ message: err.message || 'Server error' });
  });

  return app;
}
