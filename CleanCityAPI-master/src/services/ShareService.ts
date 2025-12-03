import { PrismaClient, SharedOccurrence } from '@prisma/client';
import { ShareRequest } from '../types';

const prisma = new PrismaClient();

export class ShareService {
  async shareOccurrence(
    userId: string,
    data: ShareRequest
  ): Promise<SharedOccurrence> {
    // Verify occurrence belongs to user
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: data.occurrenceId },
    });

    if (!occurrence || occurrence.userId !== userId) {
      throw new Error('Unauthorized: You can only share your own occurrences');
    }

    // Find user to share with
    const userToShareWith = await prisma.user.findUnique({
      where: { email: data.userEmail },
    });

    if (!userToShareWith) {
      throw new Error('User not found');
    }

    if (userToShareWith.id === userId) {
      throw new Error('Cannot share with yourself');
    }

    // Check if already shared
    const existingShare = await prisma.sharedOccurrence.findUnique({
      where: {
        occurrenceId_sharedWithId: {
          occurrenceId: data.occurrenceId,
          sharedWithId: userToShareWith.id,
        },
      },
    });

    if (existingShare) {
      // Update permission if already shared
      return prisma.sharedOccurrence.update({
        where: { id: existingShare.id },
        data: { permission: data.permission },
      });
    }

    // Create new share
    return prisma.sharedOccurrence.create({
      data: {
        occurrenceId: data.occurrenceId,
        sharedById: userId,
        sharedWithId: userToShareWith.id,
        permission: data.permission,
      },
    });
  }

  async getSharedWithMe(userId: string): Promise<SharedOccurrence[]> {
    return prisma.sharedOccurrence.findMany({
      where: { sharedWithId: userId },
      include: {
        occurrence: {
          include: {
            photos: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        sharedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSharedByMe(userId: string): Promise<SharedOccurrence[]> {
    return prisma.sharedOccurrence.findMany({
      where: { sharedById: userId },
      include: {
        occurrence: {
          include: {
            photos: true,
          },
        },
        sharedWith: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeShare(shareId: string, userId: string): Promise<void> {
    const share = await prisma.sharedOccurrence.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new Error('Share not found');
    }

    // Only the sharer or admin can revoke
    if (share.sharedById !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.sharedOccurrence.delete({
      where: { id: shareId },
    });
  }

  async canAccessOccurrence(occurrenceId: string, userId: string): Promise<boolean> {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
    });

    if (!occurrence) return false;

    // User is owner
    if (occurrence.userId === userId) return true;

    // Check if shared
    const share = await prisma.sharedOccurrence.findFirst({
      where: {
        occurrenceId,
        sharedWithId: userId,
      },
    });

    return !!share;
  }
}

export const shareService = new ShareService();
