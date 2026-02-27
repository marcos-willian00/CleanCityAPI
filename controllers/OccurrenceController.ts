import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, OccurrenceRequest } from '../types';
import { occurrenceService } from '../services/OccurrenceService';

export class OccurrenceController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const data = req.body as OccurrenceRequest;

      // Validation
      if (!data.title || !data.description || data.latitude === undefined || data.longitude === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, latitude, longitude',
        });
        return;
      }

      const occurrence = await occurrenceService.createOccurrence(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: occurrence,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const occurrence = await occurrenceService.getOccurrenceById(id);

      if (!occurrence) {
        res.status(404).json({
          success: false,
          error: 'Occurrence not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: occurrence,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getUserOccurrences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await occurrenceService.getUserOccurrences(req.user.userId, { page, limit });

      res.status(200).json({
        success: true,
        data: result.occurrences,
        message: `Total: ${result.total}`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const result = await occurrenceService.getAllOccurrences({ page, limit });

      res.status(200).json({
        success: true,
        data: result.occurrences,
        message: `Total: ${result.total}`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getByBounds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { minLat, maxLat, minLon, maxLon } = req.query;

      if (!minLat || !maxLat || !minLon || !maxLon) {
        res.status(400).json({
          success: false,
          error: 'Missing required query parameters: minLat, maxLat, minLon, maxLon',
        });
        return;
      }

      const occurrences = await occurrenceService.getOccurrencesByBounds(
        parseFloat(minLat as string),
        parseFloat(maxLat as string),
        parseFloat(minLon as string),
        parseFloat(maxLon as string)
      );

      res.status(200).json({
        success: true,
        data: occurrences,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const data = req.body as Partial<OccurrenceRequest>;

      const occurrence = await occurrenceService.updateOccurrence(id, req.user.userId, data);

      res.status(200).json({
        success: true,
        data: occurrence,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;

      await occurrenceService.deleteOccurrence(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Occurrence deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.message === 'Unauthorized' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await occurrenceService.getOccurrenceStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const occurrenceController = new OccurrenceController();
