import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getMe, updatePushToken, sendOTP, verifyOTP } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rate limiter: max 10 auth requests (registration, login) per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    errors: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', authMiddleware, getMe);
router.patch('/me/push-token', authMiddleware, updatePushToken);

export default router;
