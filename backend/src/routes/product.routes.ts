import {Router} from 'express';
import {ProductController} from '../controllers/product.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/upload.middleware.js'

const router =  Router();
const productController = new ProductController();


router.post('/', upload.single('image'), productController.create);
router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
//router.put('/:id', productController.update);
//router.patch('/:id/deactivate',productController.deactivate);
router.patch('/:id/deactivate', authenticateToken, productController.deactivate);
router.patch('/:id/activate', authenticateToken, productController.activate);
router.put('/:id', upload.single('image'), productController.update);
export default router;