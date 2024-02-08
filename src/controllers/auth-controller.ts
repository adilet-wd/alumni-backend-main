import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';
import { validationResult, type ValidationError, type Result } from 'express-validator';
import { ApiError } from '../exeptions/api-error-exeption';
import { Errors, Success } from '../types/global';

class Controller {
  async registration (req: Request, res: Response, next: NextFunction): Promise<Response | undefined > {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { email, password, name, surname, phoneNumber } = req.body;
      const userData = await AuthService.registration(email, password, name, surname, phoneNumber);
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async activate (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const activationLink = req.params.link;
      await AuthService.activate(activationLink);
      return res.json('Successful activated');
    } catch (error) {
      next(error);
    }
  }

  async login (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { email, password } = req.body;
      const userData = await AuthService.login(email, password);
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async logout (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      return res.json({ message: Success.LOGOUT });
    } catch (error) {
      next(error);
    }
  }

  async refresh (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { refreshToken } = req.body;
      const userData = await AuthService.refresh(refreshToken);
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async changePassword (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      await AuthService.changePassword({
        oldPassword, newPassword, confirmNewPassword, id: req.user.id
      });

      return res.json({ message: Success.PASSWORD_CHANGED });
    } catch (error) {
      next(error);
    }
  }

  async sendOtp (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { email } = req.body;
      await AuthService.sendOtpCode(email);
      return res.json({ message: Success.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }

  async reSendOtp (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { email } = req.body;
      await AuthService.reSendOtpCode(email);
      return res.json({ message: Success.OTP_RESENT });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { email, code, newPassword, confirmNewPassword } = req.body;
      await AuthService.resetPassword({ email, code, newPassword, confirmNewPassword });
      return res.json({ message: Success.PASSWORD_RECOVERED });
    } catch (error) {
      next(error);
    }
  }
}

export const AuthController = new Controller();