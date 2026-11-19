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
import Product from './models/Product.js';

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

// Turns a MongoDB connection error into a short hint that never includes the connection string
export function dbProblem(err) {
  const m = String(err?.message || '');
  if (/127\.0\.0\.1|localhost/i.test(MONGO_URI || '')) return 'config: MONGO_URI points to localhost; use the Atlas connection string';
  if (/bad auth|authentication failed/i.test(m)) return 'auth: username or password in MONGO_URI is wrong';
  if (/whitelist|not authorized.*ip|ip address/i.test(m) || err?.name === 'MongooseServerSelectionError')
    return 'network: cannot reach the cluster (check Atlas Network Access allows 0.0.0.0/0, and that the cluster is running)';
  if (/querySrv|ENOTFOUND|EBADNAME/i.test(m)) return 'dns: cluster host name in MONGO_URI not found';
  if (/scheme|Invalid connection string|URI|parse/i.test(m)) return 'format: MONGO_URI is not a valid connection string';
  return `other: ${err?.name || 'Error'}`;
}

export function createApp({ serveClient = false } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // XML sitemap built from the live catalog: home, every category and every product page
  app.get(['/sitemap.xml', '/api/sitemap.xml'], async (req, res, next) => {
    try {
      const host = req.get('x-forwarded-host') || req.get('host');
      const base = (process.env.SITE_URL || `https://${host}`).replace(/\/$/, '');
      const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const [categories, products] = await Promise.all([
        Product.distinct('category'),
        Product.find({}, '_id updatedAt').lean(),
      ]);
      const urls = [
        { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
        ...categories.map((c) => ({ loc: `${base}/?cat=${encodeURIComponent(c)}`, priority: '0.8', changefreq: 'daily' })),
        ...products.map((p) => ({
          loc: `${base}/product/${p._id}`,
          lastmod: p.updatedAt?.toISOString().slice(0, 10),
          priority: '0.6',
          changefreq: 'weekly',
        })),
      ];
      const body = urls
        .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
        .join('\n');
      res
        .type('application/xml')
        .set('Cache-Control', 'public, max-age=3600')
        .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
    } catch (err) {
      next(err);
    }
  });
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
