import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/500/500`;

const products = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 59.99, stock: 25, image: img('headphones'), description: 'Over-ear Bluetooth headphones with 30-hour battery life and soft cushions.' },
  { name: 'Smart Watch', category: 'Electronics', price: 89.0, stock: 15, image: img('watch'), description: 'Tracks steps, heart rate and sleep. Water resistant.' },
  { name: 'Portable Speaker', category: 'Electronics', price: 34.5, stock: 40, image: img('speaker'), description: 'Compact speaker with deep bass and 12-hour playback.' },
  { name: 'Cotton T-Shirt', category: 'Clothing', price: 14.99, stock: 100, image: img('tshirt'), description: '100% cotton, regular fit, everyday comfort.' },
  { name: 'Denim Jacket', category: 'Clothing', price: 49.99, stock: 20, image: img('jacket'), description: 'Classic blue denim jacket with button front.' },
  { name: 'Running Shoes', category: 'Clothing', price: 69.99, stock: 30, image: img('shoes'), description: 'Lightweight running shoes with cushioned sole.' },
  { name: 'Ceramic Mug Set', category: 'Home', price: 22.0, stock: 50, image: img('mugs'), description: 'Set of 4 ceramic mugs, dishwasher safe.' },
  { name: 'Table Lamp', category: 'Home', price: 29.99, stock: 18, image: img('lamp'), description: 'Minimal desk lamp with warm LED light.' },
  { name: 'Throw Pillow', category: 'Home', price: 12.5, stock: 60, image: img('pillow'), description: 'Soft decorative pillow, 45x45 cm.' },
  { name: 'Notebook Pack', category: 'Stationery', price: 9.99, stock: 80, image: img('notebook'), description: 'Pack of 3 ruled A5 notebooks.' },
  { name: 'Fountain Pen', category: 'Stationery', price: 19.99, stock: 35, image: img('pen'), description: 'Smooth-writing fountain pen with refillable ink.' },
  { name: 'Backpack', category: 'Accessories', price: 39.99, stock: 0, image: img('backpack'), description: 'Durable 20L backpack with laptop sleeve.' },
];

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', isAdmin: true });
await User.create({ name: 'Demo User', email: 'user@shop.com', password: 'user123' });
await Product.insertMany(products);
console.log(`Seeded ${products.length} products and 2 users`);
console.log('Admin login: admin@shop.com / admin123');
console.log('User login:  user@shop.com / user123');
await mongoose.disconnect();
