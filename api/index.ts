import express from 'express';
import cors from 'cors';
import healthRoutes from '../server/routes/healthRoutes';
import userRoutes from '../server/routes/userRoutes';
import eventRoutes from '../server/routes/eventRoutes';
import aiRoutes from '../server/routes/aiRoutes';
import calendarRoutes from '../server/routes/calendarRoutes';
import vendorRoutes from '../server/routes/vendorRoutes';
import reviewRoutes from '../server/routes/reviewRoutes';
import { errorHandler } from '../server/middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// API Route Mounts (supports both /api prefix and direct relative paths in serverless environments)
app.use(['/api', '/'], healthRoutes);
app.use(['/api/auth', '/auth'], userRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/events', '/events'], eventRoutes);
app.use(['/api/ai', '/ai'], aiRoutes);
app.use(['/api/calendar', '/calendar'], calendarRoutes);
app.use(['/api/vendors', '/vendors'], vendorRoutes);
app.use(['/api/reviews', '/reviews'], reviewRoutes);

app.get(['/api', '/'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Planora AI API Serverless Engine',
    timestamp: new Date().toISOString(),
  });
});

// Always return JSON 404 for unrecognized API routes (prevents HTML error leaks)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.originalUrl || req.url} does not exist on Planora AI API server.`,
  });
});

app.use(errorHandler);

export default app;
