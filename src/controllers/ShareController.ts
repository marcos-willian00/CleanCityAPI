import { Response } from 'express';
import { AuthenticatedRequest, ShareRequest, ApiResponse } from '../types';
import { shareService } from '../services/ShareService';

export class ShareController {
  async shareOccurrence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const data = req.body as ShareRequest;

      if (!data.occurrenceId || !data.userEmail || !data.permission) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: occurrenceId, userEmail, permission',
        });
        return;
      }

      const share = await shareService.shareOccurrence(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: share,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized: You can only share your own occurrences' ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getSharedWithMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const shares = await shareService.getSharedWithMe(req.user.userId);

      res.status(200).json({
        success: true,
        data: shares,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getSharedByMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const shares = await shareService.getSharedByMe(req.user.userId);

      res.status(200).json({
        success: true,
        data: shares,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async revokeShare(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { shareId } = req.params;

      await shareService.revokeShare(shareId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Share revoked successfully',
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

export const shareController = new ShareController();
