import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/login', (req, res) => authController.login(req, res));

router.use(authMiddleware);

router.get('/profile', (req, res) => authController.getProfile(req, res));
router.put('/profile', (req, res) => authController.updateProfile(req, res));
router.post('/change-password', (req, res) => authController.changePassword(req, res));

export default router;
