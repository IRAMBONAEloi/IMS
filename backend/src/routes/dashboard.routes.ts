import {Router } from 'express';
import { DashboardController} from '../controllers/dashboard.controller.js';

import { authenticateToken} from '../middlewares/auth.middleware.js';

const router = Router();
const dashboardController = new DashboardController();

router.get('/', authenticateToken, dashboardController.getSummary);

export default router;