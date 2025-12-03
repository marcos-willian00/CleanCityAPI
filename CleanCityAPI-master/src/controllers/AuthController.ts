import { Response } from 'express';
import { AuthenticatedRequest, LoginRequest, SignupRequest, ApiResponse, UserProfile } from '../types';
import { authService } from '../services/AuthService';

export class AuthController {
  async signup(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fullName, email, password } = req.body as SignupRequest;

      // Validation
      if (!fullName || !email || !password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: fullName, email, password',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters',
        });
        return;
      }

      const result = await authService.signup({ fullName, email, password });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password',
        });
        return;
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      } as ApiResponse<UserProfile>);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { fullName, avatar } = req.body;

      const user = await authService.updateProfile(req.user.userId, {
        fullName,
        avatar,
      });

      res.status(200).json({
        success: true,
        data: user,
      } as ApiResponse<UserProfile>);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: oldPassword, newPassword',
        });
        return;
      }

      await authService.changePassword(req.user.userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      const statusCode = error.message === 'Invalid password' ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const authController = new AuthController();
