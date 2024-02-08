import { type ValidationError, type AlternativeValidationError } from 'express-validator';
import { Errors } from '../types/global';

type errorArray = Array<string | ValidationError | AlternativeValidationError>

export class ApiError extends Error {
  status: number;
  errors: errorArray;

  constructor (status: number, message: string, errors: errorArray = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError (): ApiError {
    return new ApiError(401, Errors.AUTH_ERROR);
  }

  static BadRequest (message: string, errors: errorArray = []): ApiError {
    return new ApiError(400, message, errors);
  }
}