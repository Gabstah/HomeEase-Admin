import 'dotenv/config';
import app from './app.js';
import { startVerificationWorker } from './workers/verificationQueue.js';

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    console.error('Copy Back-End/.env.example to Back-End/.env and configure it.');
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HomeEase API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

startVerificationWorker().catch((error) => {
  console.error('Failed to start verification worker', error);
});
