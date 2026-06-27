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

// Validate critical environment variables before startup
const validateEnv = (): void => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`\n[FATAL ERROR] Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please configure them in your .env file. Exiting...\n');
    process.exit(1);
  }

  const provider = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();
  if (provider === 'nodemailer') {
    const smtpRequired = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingSmtp = smtpRequired.filter(key => !process.env[key]);
    if (missingSmtp.length > 0) {
      console.warn(`[WARNING] EMAIL_PROVIDER is set to 'nodemailer', but SMTP configurations are incomplete: ${missingSmtp.join(', ')}. Email service will fallback to mock logging.`);
    } else {
      console.log(`[CONFIG] SMTP mail configurations verified successfully.`);
    }
  } else {
    console.log(`[CONFIG] Email provider is set to '${provider}'. Email service will run in mock logging mode.`);
  }

  console.log(`[CONFIG] Environment configuration validation passed.`);
};

validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 5000;

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

// Start server after database connection is established
const startServer = async () => {
  try {
    console.log('[STARTUP] Connecting to database...');
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`[STARTUP] Server successfully started and listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('[STARTUP FATAL] Failed to initialize database connection. Server not started.', error);
    process.exit(1);
  }
};

// Start or handle testing setup
if (process.env.NODE_ENV === 'test') {
  connectDB();
} else {
  startServer();
}

export default app;
