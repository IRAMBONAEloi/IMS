import {Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller.js';

const router = Router();
const supplierControllerInstance = new SupplierController();

router.post('/', supplierControllerInstance.create);
router.get('/', supplierControllerInstance.getAll);
router.get('/:id', supplierControllerInstance.getOne);
router.put('/:id', supplierControllerInstance.update);
router.delete('/:id', supplierControllerInstance.delete);

export default router;