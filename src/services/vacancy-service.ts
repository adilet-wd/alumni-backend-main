import { Errors, ImageFolders, type Vacancy, type PaginationResponse, Success } from '../types/global';
import { VacancyModel } from '../models/vacancy-model';
import { ApiError } from '../exeptions/api-error-exeption';
import { ImageService } from './image-service';
import { VacancyDto } from '../dtos/vacancy-dto';
import { paginate } from '../helpers/pagination';

interface updateVacancyProps {
  id: string
  email: string
  fields: Partial<Vacancy>
  companyLogo: undefined | string
}

class Service {
  async getVacancies (limit: number, page: number): Promise<PaginationResponse<VacancyDto>> {
    const vacancy = await paginate(VacancyModel, page, limit);
    const dtoVacancy = vacancy.results.map((nw: Vacancy) => new VacancyDto(nw));
    return {
      ...vacancy,
      results: dtoVacancy
    };
  }

  async getVacancyById (id: string): Promise<VacancyDto | undefined> {
    const vacancy = await VacancyModel.findById(id);

    if (vacancy === null) {
      throw ApiError.BadRequest(Errors.VACANCY_NOT_FOUND);
    }

    return new VacancyDto(vacancy);
  }

  async deleteVacancyById (id: string): Promise<{ message: string } | undefined> {
    const vacancy = await VacancyModel.findByIdAndDelete(id);

    if (vacancy === null) {
      throw ApiError.BadRequest(Errors.VACANCY_NOT_FOUND);
    }

    return { message: Success.VACANCY_DELETED };
  }

  async createVacancy (vacancy: Partial<Vacancy>): Promise<{ message: string, vacancy: VacancyDto }> {
    const newVacancy = await VacancyModel.create(vacancy);

    return {
      message: Success.VACANCY_CREATED,
      vacancy: new VacancyDto(newVacancy)
    };
  }

  async updateVacancyById (props: updateVacancyProps): Promise<{ message: string, news: VacancyDto } | undefined> {
    const { companyLogo, fields, id, email } = props;

    const prevVacancy = await VacancyModel.findById(id);

    if (prevVacancy === null) {
      throw ApiError.BadRequest(Errors.VACANCY_NOT_FOUND);
    }

    if (companyLogo !== undefined) {
      ImageService.removeImage(ImageFolders.COMPANY_LOGOS, prevVacancy.companyLogo);
      fields.companyLogo = companyLogo;
    }

    await prevVacancy.save();

    const vacancy = await VacancyModel.findByIdAndUpdate(id, {
      updatedBy: email,
      lastUpdate: new Date().toISOString(),
      ...fields
    }, { returnDocument: 'after' });

    if (vacancy === null) {
      throw ApiError.BadRequest(Errors.VACANCY_NOT_FOUND);
    }

    await vacancy.save();

    return {
      message: Success.VACANCY_UPDATED,
      news: new VacancyDto(vacancy)
    };
  }
}

export const VacancyService = new Service();