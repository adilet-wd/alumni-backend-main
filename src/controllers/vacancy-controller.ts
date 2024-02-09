import type { Request, Response, NextFunction } from 'express';
import { VacancyService } from '../services/vacancy-service';
import { type Result, type ValidationError, validationResult } from 'express-validator';
import { ApiError } from '../exeptions/api-error-exeption';
import { Errors } from '../types/global';

class Controller {
  async getVacancies (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }
      const page: number = parseInt(req.query.page as string, 10) || 1;
      const limit: number = parseInt(req.query.limit as string, 10) || 10;

      const vacancy = await VacancyService.getVacancies(limit, page);
      return res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }

  async getVacancyById (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }
      const id = req.params.id;
      const vacancy = await VacancyService.getVacancyById(id);
      return res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }

  async createVacancy (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const { companyName, salary, requirements, position, contacts } = req.body;

      const companyLogo = req.file?.filename;

      if (!companyLogo) {
        throw ApiError.BadRequest(Errors.LOGO_REQUIRED);
      }

      const vacancy = await VacancyService.createVacancy({
        companyName,
        salary,
        companyLogo,
        requirements,
        position,
        contacts
      });
      return res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }

  async deleteVacancyById (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }

      const id = req.params.id;
      const vacancy = await VacancyService.deleteVacancyById(id);
      return res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }

  async updateVacancyById (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const errors: Result<ValidationError> = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.BadRequest(Errors.VALIDATE_ERROR, errors.array())); return;
      }
      let companyLogo: string | undefined;
      if (req.file?.filename !== undefined) {
        companyLogo = req.file?.filename;
      }
      const id = req.params.id;
      const vacancy = await VacancyService.updateVacancyById(
        { fields: req.body, companyLogo, id, email: req.user.email }
      );
      return res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }
}

export const VacancyController = new Controller();