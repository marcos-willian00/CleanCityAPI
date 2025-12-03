import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface OccurrenceRequest {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  accelerometerX?: number;
  accelerometerY?: number;
  accelerometerZ?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

export interface EnvironmentalData {
  accelerometerX?: number;
  accelerometerY?: number;
  accelerometerZ?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

export interface ShareRequest {
  occurrenceId: string;
  userEmail: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
