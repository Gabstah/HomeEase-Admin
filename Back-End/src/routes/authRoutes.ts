import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  sendPasswordResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', sendPasswordResetEmail);
router.post('/reset-password', resetPassword);

export default router;
