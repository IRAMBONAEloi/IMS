import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new categoryController();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

export default router;
