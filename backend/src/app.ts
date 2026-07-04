import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Logging Middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes Mounted under /api
app.use('/api', routes);

// 404 Not Found Handler
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    errors: null,
  });
});

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

export default app;
