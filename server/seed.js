// Loads the sample catalog and creates the admin + demo accounts.
// WARNING: wipes all users, products and orders first.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

// The admin login is never hard-coded (this repo is public): it comes from the environment
if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('Set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in server/.env or your hosting environment.');
  process.exit(1);
}

// Sample catalog (product data and photos from dummyjson.com).
// Products are listed in display order, so give each one a slightly older
// createdAt than the one before: "newest first" then keeps that order.
const now = Date.now();
const products = JSON.parse(readFileSync(new URL('./data/products.json', import.meta.url), 'utf8')).map(
  (p, i) => ({ ...p, createdAt: new Date(now - i * 1000) })
);

await mongoose.connect(MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
await User.create({ name: 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, isAdmin: true });
await User.create({ name: 'Demo User', email: 'user@shop.com', password: 'user123' });
await Product.insertMany(products);
console.log(`Seeded ${products.length} products, admin account (${ADMIN_EMAIL}) and demo user (user@shop.com)`);
await mongoose.disconnect();
