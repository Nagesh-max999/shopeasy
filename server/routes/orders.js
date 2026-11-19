import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

const restock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));

// Place an order. Prices and stock come from the database, never from the client.
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const orderItems = [];
    let total = 0;
    for (const { productId, qty } of items) {
      const product = await Product.findById(productId);
      const quantity = Math.max(1, parseInt(qty, 10) || 1);
      if (!product) return res.status(400).json({ message: 'A product in your cart no longer exists' });
      if (product.stock < quantity)
        return res.status(400).json({ message: `Only ${product.stock} left of "${product.name}"` });
      orderItems.push({
        product: product._id, name: product.name, image: product.image,
        price: product.price, qty: quantity,
      });
      total += product.price * quantity;
    }

    // Reserve stock atomically; roll back if an item sold out in the meantime.
    const reserved = [];
    for (const item of orderItems) {
      const r = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
      if (r.modifiedCount === 0) {
        await restock(reserved);
        return res.status(400).json({ message: `"${item.name}" just sold out` });
      }
      reserved.push(item);
    }

    try {
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        totalPrice: Math.round(total * 100) / 100,
      });
      res.status(201).json(order);
    } catch (err) {
      await restock(reserved);
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

router.get('/', protect, admin, async (req, res, next) => {
  try {
    res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { status } = req.body;
    const wasCancelled = order.status === 'Cancelled';
    order.status = status;
    await order.save(); // validates the status value
    if (status === 'Cancelled' && !wasCancelled) await restock(order.items);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
