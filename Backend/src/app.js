import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit'; // NEW
import { FRONTEND_URL } from './config/config.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

//rate limiter
//tracks ip address and allows only 50 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: 'Too many requests, please try again later',
  standardHeaders: true, 
  legacyHeaders: false,
});

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NEW - Apply rate limiting to all API routes
app.use('/api/', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

export default app;