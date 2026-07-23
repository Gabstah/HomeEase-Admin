import { Router } from 'express';
import { listDisputes, updateDispute } from '../controllers/adminDisputeController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listDisputes);
router.patch('/:id', updateDispute);

export default router;
