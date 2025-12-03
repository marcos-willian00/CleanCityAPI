import { PrismaClient, Photo } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

export class PhotoService {
  async uploadPhoto(
    occurrenceId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<Photo> {
    if (!file) {
      throw new Error('No file provided');
    }

    // Verify occurrence belongs to user
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: occurrenceId },
    });

    if (!occurrence || occurrence.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const photo = await prisma.photo.create({
      data: {
        occurrenceId,
        userId,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return photo;
  }

  async getOccurrencePhotos(occurrenceId: string): Promise<Photo[]> {
    return prisma.photo.findMany({
      where: { occurrenceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePhoto(photoId: string, userId: string): Promise<void> {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete file from disk
    if (fs.existsSync(photo.filePath)) {
      fs.unlinkSync(photo.filePath);
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });
  }

  async getPhotoPath(photoId: string): Promise<string | null> {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) return null;

    return photo.filePath;
  }
}

export const photoService = new PhotoService();
