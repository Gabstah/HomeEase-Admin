import { Router } from 'express';
import authRoutes from './authRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import adminVerificationRoutes from './adminVerificationRoutes.js';
import adminUserRoutes from './adminUserRoutes.js';
import adminBookingRoutes from './adminBookingRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/verification', verificationRoutes);
router.use('/admin/verifications', adminVerificationRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/bookings', adminBookingRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'HomeEase API is running' });
});

export default router;
