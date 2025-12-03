import bcryptjs from 'bcryptjs';
import { PrismaClient, User } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { LoginRequest, SignupRequest, UserProfile } from '../types';

const prisma = new PrismaClient();

export class AuthService {
  async signup(data: SignupRequest): Promise<{ user: UserProfile; token: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate password length
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(data.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: this.mapUserToProfile(user),
      token,
    };
  }

  async login(data: LoginRequest): Promise<{ user: UserProfile; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcryptjs.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: this.mapUserToProfile(user),
      token,
    };
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return this.mapUserToProfile(user);
  }

  async updateProfile(
    userId: string,
    updates: { fullName?: string; avatar?: string }
  ): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    return this.mapUserToProfile(user);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcryptjs.compare(oldPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  private mapUserToProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
