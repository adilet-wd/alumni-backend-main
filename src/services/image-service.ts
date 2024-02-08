import path from 'path';
import fs from 'fs';
import { ApiError } from '../exeptions/api-error-exeption';
import { type ImageFolders } from '../types/global';

class Service {
  getImage (from: ImageFolders, filename: string): string | undefined {
    const filePath: string = path.join(__dirname, '..', 'images', from, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    } else {
      throw new ApiError(404, 'Image not found');
    }
  }

  removeImage (to: ImageFolders, filename: string): undefined {
    const filePath: string = path.join(__dirname, '..', 'images', to, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getImageUrl (file: string | string[], folder: ImageFolders): string | string[] {
    const localUrl = process.env.API_URL as string;

    if (Array.isArray(file)) {
      return file.map((fl) => {
        return `${localUrl}/api/images/${folder}/${fl}`;
      });
    }

    return `${localUrl}/api/images/${folder}/${file}`;
  }
}

export const ImageService = new Service();