import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?search=&category=&sort=price_asc|price_desc|newest
router.get('/', async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: escapeRegex(String(search)), $options: 'i' };
    if (category) filter.category = String(category);
    const sortBy =
      sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: -1 };
    res.json(await Product.find(filter).sort(sortBy));
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    res.json((await Product.distinct('category')).sort());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

const pick = ({ name, description, price, image, category, stock }) => ({
  name, description, price, image, category, stock,
});

router.post('/', protect, admin, async (req, res, next) => {
  try {
    res.status(201).json(await Product.create(pick(req.body)));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
