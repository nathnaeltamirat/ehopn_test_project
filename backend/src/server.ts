import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';

const envPath = path.join(process.cwd(), '.env');
console.log('🔍 Looking for .env file at:', envPath);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('🔍 Environment variables check:');
console.log('🔍 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Not found');
console.log('🔍 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Not found');
console.log('🔍 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Not found');
console.log('🔍 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Loaded' : '❌ Not found');


import passport from './config/passport';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoices';
import subscriptionRoutes from './routes/subscription';
import userRoutes from './routes/user';


import { connectDB } from './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/subscription/webhook', express.raw({ type: 'application/json' }));


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/auth', authRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/user', userRoutes);


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }

  if (err.message === 'Invalid file type. Only PDF, images, and Excel files are allowed.') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});


app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


const startServer = async () => {
  try {

    await connectDB();

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }


    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};


process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
