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
  poster: undefined | string
  newsImages: undefined | string[]
}

class Service {
  // async getNews (limit: number, page: number): Promise<PaginationResponse<VacancyDto>> {
  //   const news = await paginate(VacancyModel, page, limit);
  //   const dtoNews = news.results.map((nw: News) => new VacancyDto(nw));
  //   return {
  //     ...news,
  //     results: dtoNews
  //   };
  // }

  // async getNewsById (id: string): Promise<VacancyDto | undefined> {
  //   const news = await VacancyModel.findById(id);

  //   if (news === null) {
  //     throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
  //   }

  //   return new VacancyDto(news);
  // }

  // async deleteNewsById (id: string): Promise<{ message: string } | undefined> {
  //   const news = await VacancyModel.findByIdAndDelete(id);

  //   if (news === null) {
  //     throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
  //   }

  //   return { message: Success.NEWS_DELETED };
  // }

  async createVacancy (vacancy: Partial<Vacancy>): Promise<{ message: string, vacancy: VacancyDto }> {
    const newVacancy = await VacancyModel.create(vacancy);

    return {
      message: Success.VACANCY_CREATED,
      vacancy: new VacancyDto(newVacancy)
    };
  }

  // async updateNewsById (props: updateNewsProps): Promise<{ message: string, news: VacancyDto } | undefined> {
  //   const { poster, fields, id, newsImages, email } = props;

  //   const prevNews = await VacancyModel.findById(id);

  //   if (prevNews === null) {
  //     throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
  //   }

  //   if (newsImages !== undefined) {
  //     if (prevNews.newsImages.length !== 0) {
  //       prevNews.newsImages.forEach((image): void => {
  //         ImageService.removeImage(ImageFolders.NEWS_IMAGES, image);
  //       });
  //     }
  //     fields.newsImages = newsImages;
  //   }

  //   if (poster !== undefined) {
  //     ImageService.removeImage(ImageFolders.POSTERS, prevNews.poster);
  //     fields.poster = poster;
  //   }

  //   await prevNews.save();

  //   const news = await VacancyModel.findByIdAndUpdate(id, {
  //     updatedBy: email,
  //     lastUpdate: new Date().toISOString(),
  //     ...fields
  //   }, { returnDocument: 'after' });

  //   if (news === null) {
  //     throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
  //   }

  //   await news.save();

  //   return {
  //     message: Success.NEWS_UPDATED,
  //     news: new VacancyDto(news)
  //   };
  // }
}

export const VacancyService = new Service();