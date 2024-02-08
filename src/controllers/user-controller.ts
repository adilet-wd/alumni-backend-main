import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user-service';
import { validationResult, type ValidationError, type Result } from 'express-validator';
import { ApiError } from '../exeptions/api-error-exeption';
import { Errors, Success } from '../types/global';

class Controller {
  async getProfile (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const userData = await UserService.getProfile(req.user.email);
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {
      next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
    }

    try {
      const userData = await UserService.updateProfile(req.user.id, req.body, req.file?.filename);
      return res.json({
        message: Success.USER_UPDATED,
        user: userData
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const page: number = parseInt(req.query.page as string, 10) || 1;
      const limit: number = parseInt(req.query.limit as string, 10) || 10;

      const users = await UserService.getUsers(limit, page, req.body);
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const id = req.params.id;
      const user = await UserService.getUserById(id);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const UserController = new Controller();