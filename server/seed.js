import 'dotenv/config';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

// Sample catalog (product data and photos from dummyjson.com).
// Products are listed in display order, so give each one a slightly older
// createdAt than the one before: "newest first" then keeps that order.
const now = Date.now();
const products = JSON.parse(readFileSync(new URL('./data/products.json', import.meta.url), 'utf8')).map(
  (p, i) => ({ ...p, createdAt: new Date(now - i * 1000) })
);

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', isAdmin: true });
await User.create({ name: 'Demo User', email: 'user@shop.com', password: 'user123' });
await Product.insertMany(products);
console.log(`Seeded ${products.length} products and 2 users`);
console.log('Admin login: admin@shop.com / admin123');
console.log('User login:  user@shop.com / user123');
await mongoose.disconnect();
