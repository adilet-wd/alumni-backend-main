import { type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../exeptions/api-error-exeption';
import { Errors } from '../types/global';
export const roleCheckMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user.isAdmin) {
    next();
  } else {
    // eslint-disable-next-line
    next(ApiError.BadRequest(Errors.AUTH_PERMISSION_DENIED)); return;
  }
};