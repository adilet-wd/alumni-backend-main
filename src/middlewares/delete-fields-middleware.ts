import type { NextFunction, Response, Request } from 'express';

export const deleteFieldsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  delete req.body.password;
  delete req.body.createdAt;
  delete req.body.email;
  delete req.body.id;
  next();
};