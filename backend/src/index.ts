import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {PrismaClient} from '@prisma/client';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import ProductRoutes from './routes/product.routes.js'
import { authenticateToken } from './middlewares/auth.middleware.js';
import stockMovementRputes from './routes/stockMovement.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';


dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/hello', (req, res) => {
  res.json({status : 'Ok' ,message:'Hello, IMS API is running!'});
});


app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products',ProductRoutes);
app.use('/api/stock-movements', authenticateToken, stockMovementRputes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost: ${PORT}`);
  console.log(`check: http://localhost:${PORT}/hello`);
  console.log(`Press Ctrl+C to stop the server.`);
});