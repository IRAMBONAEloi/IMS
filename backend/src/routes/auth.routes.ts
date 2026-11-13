import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new AuthController();
const authenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please try again later.' },
});

router.post('/login', authenticationLimiter, controller.login);
router.post('/register', authenticationLimiter, controller.register);
router.get('/me', authenticateToken, controller.me);
router.post('/logout', controller.logout);

export default router;
