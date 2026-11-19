// Vercel serverless entry: every /api/* request is routed here (see vercel.json).
// The website itself is served by Vercel as static files from client/dist.
import { createApp, connectDB, configError, dbProblem, dbTarget } from '../server/app.js';

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
    if (req.url.startsWith('/api/health')) {
      // Underlying cause, with anything that looks like credentials stripped out
      const detail = String(err.cause?.message || err.reason?.error?.message || err.message || '')
        .replace(/\/\/[^@\s]*@/g, '//***@')
        .slice(0, 300);
      return res.status(503).json({ ok: false, db: reason, target: dbTarget(), detail });
    }
    return res.status(503).json({ message: 'Database unavailable, please try again' });
  }
  return app(req, res);
}
