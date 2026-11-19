import { Router } from 'express';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';

const router = Router();

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: String(email).toLowerCase() }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ user: publicUser(user), token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user || !(await user.matchPassword(String(password || ''))))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ user: publicUser(user), token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, (req, res) => res.json(publicUser(req.user)));

export default router;
