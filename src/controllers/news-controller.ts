import type { Request, Response, NextFunction } from 'express';
import { NewsService } from '../services/news-service';
import { type Result, type ValidationError, validationResult } from 'express-validator';
import { ApiError } from '../exeptions/api-error-exeption';
import { Errors, type RequestForMulter } from '../types/global';

class Controller {
  async getNews (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }
      const page: number = parseInt(req.query.page as string, 10) || 1;
      const limit: number = parseInt(req.query.limit as string, 10) || 10;

      const news = await NewsService.getNews(limit, page);
      return res.json(news);
    } catch (error) {
      next(error);
    }
  }

  async getNewsById (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }
      const id = req.params.id;
      const news = await NewsService.getNewsById(id);
      return res.json(news);
    } catch (error) {
      next(error);
    }
  }

  async createNews (req: RequestForMulter, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { title, shortDescribe, content } = req.body;

      let newsImages: string[] = [];
      let poster: undefined | string;

      if (req.files.newsImages !== undefined) {
        newsImages = req.files.newsImages.map(file => file.filename);
      }

      if (req.files.posters !== undefined) {
        poster = req.files.posters[0].filename;
      } else {
        throw ApiError.BadRequest(Errors.POSTER_REQUIRED);
      }

      const news = await NewsService.createNews({
        title,
        shortDescribe,
        poster,
        content,
        newsImages
      });

      return res.json(news);
    } catch (error) {
      next(error);
    }
  }

  async deleteNewsById (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const id = req.params.id;
      const news = await NewsService.deleteNewsById(id);
      return res.json(news);
    } catch (error) {
      next(error);
    }
  }

  async updateNewById (req: RequestForMulter, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);
      let poster: string | undefined;
      let newsImages: string[] | undefined;

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      if (req.files.posters !== undefined) {
        poster = req.files.posters[0].filename;
      }

      if (req.files.newsImages !== undefined) {
        newsImages = req.files.newsImages.map((file) => file.filename);
      }

      const id = req.params.id;
      const news = await NewsService.updateNewsById(
        { fields: req.body, poster, newsImages, id, email: req.user.email }
      );

      return res.json(news);
    } catch (error) {
      next(error);
    }
  }
}

export const NewsController = new Controller();