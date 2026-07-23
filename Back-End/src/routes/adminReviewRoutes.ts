import { Router } from 'express';
import { listReviews, getReviewById, updateReview } from '../controllers/adminReviewController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listReviews);
router.get('/:id', getReviewById);
router.patch('/:id', updateReview);

export default router;
