import type { NextFunction, Response, Request } from 'express';
import { ApiError } from '../exeptions/api-error-exeption';
import { TokenService } from '../services/token-service';
import { type reqUser } from '../types/global';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader === undefined) {
      next(ApiError.UnauthorizedError()); return;
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (accessToken === null) {
      next(ApiError.UnauthorizedError()); return;
    }

    const userData = TokenService.validateAccessToken(accessToken);
    if (userData === null || typeof userData === 'string') {
      next(ApiError.UnauthorizedError()); return;
    }

    req.user = userData as reqUser;

    next();
  } catch (error) {
    next(ApiError.UnauthorizedError());
  }
};