import {Router} from 'express';
import {ProductController} from '../controllers/product.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router =  Router();
const productController = new ProductController();


router.post('/', productController.create);
router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.put('/:id', productController.update);
router.patch('/:id/deactivate',productController.deactivate);
router.patch('/:id/deactivate', authenticateToken, productController.deactivate);

export default router;