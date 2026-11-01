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

// API Route Mounts
app.use('/api', healthRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(errorHandler);

export default app;
