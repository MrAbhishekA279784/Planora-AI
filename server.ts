import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import healthRoutes from './server/routes/healthRoutes';
import userRoutes from './server/routes/userRoutes';
import eventRoutes from './server/routes/eventRoutes';
import aiRoutes from './server/routes/aiRoutes';
import calendarRoutes from './server/routes/calendarRoutes';
import vendorRoutes from './server/routes/vendorRoutes';
import reviewRoutes from './server/routes/reviewRoutes';
import { errorHandler } from './server/middleware/errorHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // Mount API Router Modules
  app.use('/api', healthRoutes);
  app.use('/api/auth', userRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/reviews', reviewRoutes);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  // Vite middleware in dev or static serve in prod
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Planora AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
