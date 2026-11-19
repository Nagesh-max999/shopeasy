// Long-running server: local development and hosts like Railway, Render or a VPS.
import { createApp, connectDB, configError } from './app.js';

const problem = configError();
if (problem) {
  console.error(problem);
  process.exit(1);
}

const app = createApp({ serveClient: true });
const PORT = process.env.PORT || 5050;

connectDB()
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
