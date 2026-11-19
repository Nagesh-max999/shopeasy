// Vercel serverless entry: every /api/* request is routed here (see vercel.json).
// The website itself is served by Vercel as static files from client/dist.
import { createApp, connectDB, configError, dbProblem } from '../server/app.js';

const app = createApp();

export default async function handler(req, res) {
  const problem = configError();
  if (problem) {
    console.error(problem);
    return res.status(500).json({ message: 'Server is not configured' });
  }
  try {
    await connectDB();
  } catch (err) {
    const reason = dbProblem(err);
    console.error('MongoDB connection failed:', reason, '|', err.message);
    // The health check names the cause (no secrets) to make setup problems easy to fix
    if (req.url.startsWith('/api/health')) return res.status(503).json({ ok: false, db: reason });
    return res.status(503).json({ message: 'Database unavailable, please try again' });
  }
  return app(req, res);
}
