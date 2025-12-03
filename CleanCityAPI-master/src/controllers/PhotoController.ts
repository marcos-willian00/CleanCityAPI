import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { photoService } from '../services/PhotoService';
import fs from 'fs';
import path from 'path';

export class PhotoController {
  async uploadPhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { occurrenceId } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file provided',
        });
        return;
      }

      const photo = await photoService.uploadPhoto(occurrenceId, req.user.userId, req.file);

      res.status(201).json({
        success: true,
        data: photo,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getOccurrencePhotos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { occurrenceId } = req.params;

      const photos = await photoService.getOccurrencePhotos(occurrenceId);

      res.status(200).json({
        success: true,
        data: photos,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async downloadPhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { photoId } = req.params;

      const filePath = await photoService.getPhotoPath(photoId);

      if (!filePath || !fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'Photo not found',
        });
        return;
      }

      res.download(filePath);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deletePhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { photoId } = req.params;

      await photoService.deletePhoto(photoId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Photo deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const photoController = new PhotoController();
