import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { photoController } from '../controllers/PhotoController';
import { authMiddleware } from '../middleware/auth';

const uploadPath = process.env.UPLOAD_PATH || './uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  },
});

const router = Router();

router.use(authMiddleware);

router.post('/:occurrenceId', upload.single('photo'), (req, res) => photoController.uploadPhoto(req, res));
router.get('/:occurrenceId', (req, res) => photoController.getOccurrencePhotos(req, res));
router.get('/download/:photoId', (req, res) => photoController.downloadPhoto(req, res));
router.delete('/:photoId', (req, res) => photoController.deletePhoto(req, res));

export default router;
