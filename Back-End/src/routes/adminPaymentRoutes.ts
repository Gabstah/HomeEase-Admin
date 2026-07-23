import { Router } from 'express';
import { listPayments, getPaymentById } from '../controllers/adminPaymentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listPayments);
router.get('/:id', getPaymentById);

export default router;
