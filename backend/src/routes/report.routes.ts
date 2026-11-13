import {Router} from 'express';
import {ReportController} from '../controllers/report.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';


const router = Router();
const reportController = new ReportController;



router.get('/low-stock', authenticateToken, reportController.getLowStock);

router.get('/out-of-stock', authenticateToken, reportController.getOutOfStock);

router.get('/inventory-value',authenticateToken, reportController.getInventoryValue);

export default router;