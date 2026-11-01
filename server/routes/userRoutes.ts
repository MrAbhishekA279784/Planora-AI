import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createSession, syncUser, getProfile, updateProfile, uploadAvatar } from '../controllers/userController';

const router = Router();

router.post('/session', createSession);
router.post('/sync', authenticateToken, syncUser);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/avatar', authenticateToken, uploadAvatar);

export default router;
