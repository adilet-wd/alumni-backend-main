import { type Types } from 'mongoose';
import { ImageFolders, type User } from '../types/global';
import { ImageService } from '../services/image-service';

export class UserDto {
  id: Types.ObjectId;
  email: string;
  name: string;
  surname: string;
  isAdmin: boolean;
  education: string;
  specialty: string;
  yearOfRelease: number;
  place: string;
  phoneNumber: string;
  workPlace: string;
  positionAtWork: string;
  shortBiography: string;
  educationAndGoals: string;
  avatar: string | string[] | null;
  createdAt: string;

  constructor (model: User) {
    this.id = model._id;
    this.name = model.name;
    this.surname = model.surname;
    this.email = model.email;
    this.isAdmin = model.isAdmin;
    this.education = model.education;
    this.specialty = model.specialty;
    this.yearOfRelease = model.yearOfRelease;
    this.place = model.place;
    this.phoneNumber = model.phoneNumber;
    this.workPlace = model.workPlace;
    this.positionAtWork = model.positionAtWork;
    this.shortBiography = model.shortBiography;
    this.educationAndGoals = model.educationAndGoals;
    this.avatar = model.avatar === null ? null : ImageService.getImageUrl(model.avatar, ImageFolders.AVATARS);
    this.createdAt = model.createdAt;
  }
}