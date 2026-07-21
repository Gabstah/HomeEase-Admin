import { Router } from 'express';
import { listBookings, getBookingById } from '../controllers/adminBookingController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listBookings);
router.get('/:id', getBookingById);

export default router;
