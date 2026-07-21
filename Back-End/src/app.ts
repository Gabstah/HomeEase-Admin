import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorResponse } from './utils/errorResponse.js';
import { ensureUploadDirs, VERIFICATION_UPLOAD_DIR } from './config/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ensureUploadDirs();

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/verifications', express.static(VERIFICATION_UPLOAD_DIR));

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json(errorResponse(404, 'Route not found'));
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);

    if (err.message.includes('Only JPG, PNG, WEBP, and PDF')) {
      return res.status(400).json(errorResponse(400, err.message));
    }

    if (err.message.includes('File too large')) {
      return res.status(400).json(errorResponse(400, 'File exceeds 5MB limit'));
    }

    res.status(500).json(errorResponse(500, 'Internal server error'));
  }
);

export default app;
