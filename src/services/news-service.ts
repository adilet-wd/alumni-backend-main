import { Errors, ImageFolders, type News, type PaginationResponse, Success } from '../types/global';
import { NewsModel } from '../models/news-model';
import { ApiError } from '../exeptions/api-error-exeption';
import { ImageService } from './image-service';
import { NewsDto } from '../dtos/news-dto';
import { paginate } from '../helpers/pagination';

interface updateNewsProps {
  id: string
  email: string
  fields: Partial<News>
  poster: undefined | string
  newsImages: undefined | string[]
}

class Service {
  async getNews (limit: number, page: number): Promise<PaginationResponse<NewsDto>> {
    const news = await paginate(NewsModel, page, limit);
    const dtoNews = news.results.map((nw: News) => new NewsDto(nw));
    return {
      ...news,
      results: dtoNews
    };
  }

  async getNewsById (id: string): Promise<NewsDto | undefined> {
    const news = await NewsModel.findById(id);

    if (news === null) {
      throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
    }

    return new NewsDto(news);
  }

  async deleteNewsById (id: string): Promise<{ message: string } | undefined> {
    const news = await NewsModel.findByIdAndDelete(id);

    if (news === null) {
      throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
    }

    return { message: Success.NEWS_DELETED };
  }

  async createNews (news: Partial<News>): Promise<{ message: string, news: NewsDto }> {
    const newNews = await NewsModel.create(news);

    return {
      message: Success.NEWS_CREATED,
      news: new NewsDto(newNews)
    };
  }

  async updateNewsById (props: updateNewsProps): Promise<{ message: string, news: NewsDto } | undefined> {
    const { poster, fields, id, newsImages, email } = props;

    const prevNews = await NewsModel.findById(id);

    if (prevNews === null) {
      throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
    }

    if (newsImages !== undefined) {
      if (prevNews.newsImages.length !== 0) {
        prevNews.newsImages.forEach((image): void => {
          ImageService.removeImage(ImageFolders.NEWS_IMAGES, image);
        });
      }
      fields.newsImages = newsImages;
    }

    if (poster !== undefined) {
      ImageService.removeImage(ImageFolders.POSTERS, prevNews.poster);
      fields.poster = poster;
    }

    await prevNews.save();

    const news = await NewsModel.findByIdAndUpdate(id, {
      updatedBy: email,
      lastUpdate: new Date().toISOString(),
      ...fields
    }, { returnDocument: 'after' });

    if (news === null) {
      throw ApiError.BadRequest(Errors.NEWS_NOT_FOUND);
    }

    await news.save();

    return {
      message: Success.NEWS_UPDATED,
      news: new NewsDto(news)
    };
  }
}

export const NewsService = new Service();