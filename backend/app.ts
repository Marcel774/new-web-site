import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import authRoutes from './routes/authRoutes.ts';
import categoryRoutes from './routes/categoryRoutes.ts';
import movieRoutes from './routes/movieRoutes.ts';

export function createBackendApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  const allowedOrigins = new Set(
    [process.env.APP_URL?.trim(), 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(
      (origin): origin is string => Boolean(origin)
    )
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'movieflix-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/categories', categoryRoutes);

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[MOVIEFLIX API Error]', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  return app;
}
