import { PrismaClient, Occurrence, OccurrenceStatus } from '@prisma/client';
import { OccurrenceRequest, EnvironmentalData, PaginationQuery } from '../types';

const prisma = new PrismaClient();

export class OccurrenceService {
  async createOccurrence(
    userId: string,
    data: OccurrenceRequest
  ): Promise<Occurrence> {
    const occurrence = await prisma.occurrence.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        accelerometerX: data.accelerometerX,
        accelerometerY: data.accelerometerY,
        accelerometerZ: data.accelerometerZ,
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
      },
    });

    return occurrence;
  }

  async getOccurrenceById(occurrenceId: string): Promise<Occurrence | null> {
    return prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        photos: true,
        sharedWith: {
          include: {
            sharedWith: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserOccurrences(
    userId: string,
    query: PaginationQuery = {}
  ): Promise<{ occurrences: Occurrence[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [occurrences, total] = await Promise.all([
      prisma.occurrence.findMany({
        where: { userId },
        include: { photos: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.occurrence.count({
        where: { userId },
      }),
    ]);

    return { occurrences, total };
  }

  async getAllOccurrences(query: PaginationQuery = {}): Promise<{
    occurrences: Occurrence[];
    total: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [occurrences, total] = await Promise.all([
      prisma.occurrence.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          photos: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.occurrence.count(),
    ]);

    return { occurrences, total };
  }

  async getOccurrencesByBounds(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number
  ): Promise<Occurrence[]> {
    return prisma.occurrence.findMany({
      where: {
        latitude: {
          gte: minLat,
          lte: maxLat,
        },
        longitude: {
          gte: minLon,
          lte: maxLon,
        },
      },
      include: {
        photos: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async updateOccurrence(
    occurrenceId: string,
    userId: string,
    data: Partial<OccurrenceRequest>
  ): Promise<Occurrence> {
    // Verify ownership
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
    });

    if (!occurrence || occurrence.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.occurrence.update({
      where: { id: occurrenceId },
      data: {
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        accelerometerX: data.accelerometerX,
        accelerometerY: data.accelerometerY,
        accelerometerZ: data.accelerometerZ,
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
      },
    });
  }

  async updateOccurrenceStatus(
    occurrenceId: string,
    status: OccurrenceStatus
  ): Promise<Occurrence> {
    return prisma.occurrence.update({
      where: { id: occurrenceId },
      data: { status },
    });
  }

  async deleteOccurrence(occurrenceId: string, userId: string): Promise<void> {
    // Verify ownership
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
    });

    if (!occurrence || occurrence.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.occurrence.delete({
      where: { id: occurrenceId },
    });
  }

  async getOccurrenceStats(): Promise<{
    total: number;
    pending: number;
    verified: number;
    resolved: number;
  }> {
    const total = await prisma.occurrence.count();
    const pending = await prisma.occurrence.count({
      where: { status: OccurrenceStatus.PENDING },
    });
    const verified = await prisma.occurrence.count({
      where: { status: OccurrenceStatus.VERIFIED },
    });
    const resolved = await prisma.occurrence.count({
      where: { status: OccurrenceStatus.RESOLVED },
    });

    return { total, pending, verified, resolved };
  }
}

export const occurrenceService = new OccurrenceService();
