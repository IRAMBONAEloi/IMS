import {Router} from 'express';
import {StockMovementController} from '../controllers/stockMovement.controller.js';
import{authenticateToken} from '../middlewares/auth.middleware.js';


const router = Router();
const stockMovementController = new StockMovementController();



router.post('/', (req,res)=>  stockMovementController.create(req,res));
router.get('/', (req,res)=>   stockMovementController.getAll(req,res));


export default router;