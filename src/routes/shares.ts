import { Router } from 'express';
import { shareController } from '../controllers/ShareController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', (req, res) => shareController.shareOccurrence(req, res));
router.get('/shared-with-me', (req, res) => shareController.getSharedWithMe(req, res));
router.get('/shared-by-me', (req, res) => shareController.getSharedByMe(req, res));
router.delete('/:shareId', (req, res) => shareController.revokeShare(req, res));

export default router;
