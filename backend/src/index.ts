import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import productRoutes from './routes/product.routes.js';
import { authenticateToken } from './middlewares/auth.middleware.js';
import stockMovementRoutes from './routes/stockMovement.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import userRoutes from './routes/user.routes.js';
import path from 'node:path';
import { getUploadDirectory } from './middlewares/upload.middleware.js';

if (process.env.NODE_ENV !== 'production') dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.APP_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/hello', (_req, res) => res.json({ status: 'Ok', message: 'IMS API is running.' }));
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/suppliers', authenticateToken, supplierRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/stock-movements', authenticateToken, stockMovementRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(getUploadDirectory(), { maxAge: '1h', fallthrough: false }));
app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads'), { maxAge: '1h', fallthrough: false }));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next;
  console.error('Unhandled API error:', error instanceof Error ? error.message : 'Unknown error');
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.info(`IMS API listening on port ${PORT}`));
}

export { app };
export { prisma } from './db.js';
