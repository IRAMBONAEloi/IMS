import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
const userController = new UserController();

router.get('/', authenticateToken, requireAdmin, userController.getAll);
router.post('/', authenticateToken, requireAdmin, userController.create);
router.delete('/:id', authenticateToken, requireAdmin, userController.delete);

export default router;