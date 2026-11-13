import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new UserController();

router.use(authenticateToken, requireAdmin);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;
