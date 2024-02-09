import { type Types } from 'mongoose';
import { ImageFolders, type Vacancy, type vacancyContacts } from '../types/global';
import { ImageService } from '../services/image-service';

export class VacancyDto {
  id: Types.ObjectId;
  companyName: string;
  companyLogo: string | string[] | null;
  salary: string;
  requirements: string;
  position: string;
  contacts: vacancyContacts[];
  createdAt?: string;
  lastUpdate?: string;
  updatedBy?: string;

  constructor (model: Vacancy) {
    this.id = model._id;
    this.companyName = model.companyName;
    this.companyLogo = ImageService.getImageUrl(model.companyLogo, ImageFolders.COMPANY_LOGOS);
    this.salary = model.salary;
    this.requirements = model.requirements;
    this.position = model.position;
    this.contacts = model.contacts;
    this.lastUpdate = model.lastUpdate;
    this.updatedBy = model.updatedBy;
  }
}