import { Router } from 'express';
import {
  listVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
  rerunVerification,
} from '../controllers/adminVerificationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listVerifications);
router.get('/:id', getVerificationById);
router.patch('/:id/approve', approveVerification);
router.patch('/:id/reject', rejectVerification);
router.patch('/:id/rerun', rerunVerification);

export default router;
