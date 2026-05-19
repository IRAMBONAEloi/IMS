import {Router} from 'express';
import {categoryController} from '../controllers/category.controller.js';

const router = Router();
const categoryControllerInstance = new categoryController();

router.post('/', categoryControllerInstance.create);
router.get('/', categoryControllerInstance.getAll);
router.get('/:id', categoryControllerInstance.getOne);
router.put('/:id', categoryControllerInstance.update);
router.delete('/:id',categoryControllerInstance.delete);

export default router;