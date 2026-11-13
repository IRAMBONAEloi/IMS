import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();
const controller = new ProductController();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', requireAdmin, upload.single('image'), controller.create);
router.put('/:id', requireAdmin, upload.single('image'), controller.update);
router.patch('/:id/deactivate', requireAdmin, controller.deactivate);
router.patch('/:id/activate', requireAdmin, controller.activate);

export default router;
