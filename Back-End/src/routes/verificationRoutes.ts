import { Router } from 'express';
import {
  uploadVerificationDocuments,
  getMyVerifications,
} from '../controllers/verificationController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { verificationUpload } from '../config/upload.js';

const router = Router();

router.post(
  '/upload',
  authenticate,
  requireRoles('CLIENT', 'WORKER'),
  verificationUpload.array('documents', 5),
  uploadVerificationDocuments
);

router.get(
  '/mine',
  authenticate,
  requireRoles('CLIENT', 'WORKER'),
  getMyVerifications
);

export default router;
