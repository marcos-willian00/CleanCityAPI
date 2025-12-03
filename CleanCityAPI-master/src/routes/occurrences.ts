import { Router } from 'express';
import { occurrenceController } from '../controllers/OccurrenceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', (req, res) => occurrenceController.getStats(req, res));
router.get('/bounds', (req, res) => occurrenceController.getByBounds(req, res));
router.get('/', (req, res) => occurrenceController.getAll(req, res));

router.use(authMiddleware);

router.post('/', (req, res) => occurrenceController.create(req, res));
router.get('/my-occurrences', (req, res) => occurrenceController.getUserOccurrences(req, res));
router.get('/:id', (req, res) => occurrenceController.getById(req, res));
router.put('/:id', (req, res) => occurrenceController.update(req, res));
router.delete('/:id', (req, res) => occurrenceController.delete(req, res));

export default router;
