import { Router } from 'express';
import { listClients, getClientById, listWorkers, getWorkerById, updateUserStatus } from '../controllers/adminUserController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/clients', listClients);
router.get('/clients/:id', getClientById);
router.get('/workers', listWorkers);
router.get('/workers/:id', getWorkerById);
router.patch('/:id/status', updateUserStatus);

export default router;
