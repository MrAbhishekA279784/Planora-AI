import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Planora AI API',
    timestamp: new Date().toISOString(),
    hasAiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

export default router;
