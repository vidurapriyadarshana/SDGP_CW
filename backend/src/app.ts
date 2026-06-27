import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';
import morganMiddleware from './middleware/logger.middleware';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);

// Setup Swagger Docs
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Base route info
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Quiz Web App API is active and running.' });
});

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
