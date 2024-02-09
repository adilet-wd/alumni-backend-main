import type { NextFunction, Request, Response } from 'express';
import { ImageService } from '../services/image-service';
import { ImageFolders } from '../types/global';
import { ApiError } from '../exeptions/api-error-exeption';

class Controller {
  getNewsImage (req: Request, res: Response, next: NextFunction): void {
    try {
      const image = ImageService.getImage(ImageFolders.NEWS_IMAGES, req.params.filepath);
      if (image === undefined) {
        throw ApiError.BadRequest('Pass image name please');
      }
      res.sendFile(image);
    } catch (error) {
      next(error);
    }
  }

  getPoster (req: Request, res: Response, next: NextFunction): void {
    try {
      const image = ImageService.getImage(ImageFolders.POSTERS, req.params.filepath);

      if (image === undefined) {
        throw ApiError.BadRequest('Pass image name please');
      }

      res.sendFile(image);
    } catch (error) {
      next(error);
    }
  }

  getAvatar (req: Request, res: Response, next: NextFunction): void {
    try {
      const image = ImageService.getImage(ImageFolders.AVATARS, req.params.filepath);
      if (image === undefined) {
        throw ApiError.BadRequest('Pass image name please');
      }
      res.sendFile(image);
    } catch (error) {
      next(error);
    }
  }

  getCompanyLogo (req: Request, res: Response, next: NextFunction): void {
    try {
      const image = ImageService.getImage(ImageFolders.COMPANY_LOGOS, req.params.filepath);
      if (image === undefined) {
        throw ApiError.BadRequest('Pass image name please');
      }
      res.sendFile(image);
    } catch (error) {
      next(error);
    }
  }
}

export const ImageController = new Controller();