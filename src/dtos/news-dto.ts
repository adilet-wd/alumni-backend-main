import { type Types } from 'mongoose';
import { ImageFolders, type News, type newsContent } from '../types/global';
import { ImageService } from '../services/image-service';

export class NewsDto {
  id: Types.ObjectId;
  title: string;
  poster: string | string[] | null;
  shortDescribe: string;
  content: newsContent[];
  newsImages: string | string[] | null;
  createdAt?: string;
  lastUpdate?: string;
  updatedBy?: string;

  constructor (model: News) {
    this.id = model._id;
    this.title = model.title;
    this.poster = ImageService.getImageUrl(model.poster, ImageFolders.POSTERS);
    this.shortDescribe = model.shortDescribe;
    this.content = model.content;
    this.newsImages = ImageService.getImageUrl(model.newsImages, ImageFolders.NEWS_IMAGES);
    this.lastUpdate = model.lastUpdate;
    this.updatedBy = model.updatedBy;
  }
}