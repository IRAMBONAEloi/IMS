import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {PrismaClient} from '@prisma/client';
import authRoutes from './routes/auth.routes.js';


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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost: ${PORT}`);
  console.log(`check: http://localhost:${PORT}/hello`);
  console.log(`Press Ctrl+C to stop the server.`);
});