// File storage utilities for local MySQL setup
import fs from 'fs';
import path from 'path';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

export async function uploadPhotoLocally(
  filename: string,
  file: Buffer
): Promise<string> {
  try {
    const filepath = path.join(UPLOAD_PATH, filename);
    fs.writeFileSync(filepath, file);
    return filepath;
  } catch (error: any) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

export async function deletePhotoLocally(
  filepath: string
): Promise<void> {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
