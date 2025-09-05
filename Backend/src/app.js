import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { FRONTEND_URL } from './config/config.js';  
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
// Central error handler
app.use(errorHandler);

export default app;
