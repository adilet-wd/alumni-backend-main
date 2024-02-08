import { type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../exeptions/api-error-exeption';
import { Errors } from '../types/global';
export const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction): Response => {
  console.log(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({ message: Errors.UNEXPECTED_ERROR, errors: [err] });
};