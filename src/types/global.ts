import { type Schema, type Document } from 'mongoose';
import { type Express, type Request } from 'express';

export interface User extends Document {
  email: string
  password: string
  name: string
  surname: string
  isActivated: boolean
  isAdmin: boolean
  activationLink: string
  resetCode: number | null
  education: string
  specialty: string
  yearOfRelease: number
  place: string
  phoneNumber: string
  workPlace: string
  positionAtWork: string
  shortBiography: string
  educationAndGoals: string
  avatar: string
  createdAt: string
}

export interface PaginationResponse<T> {
  total: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  perPage: number
  results: T[]
}

export interface newsContent {
  title: string
  paragraph: string
}

export interface News extends Document {
  title: string
  poster: string
  shortDescribe: string
  content: newsContent[]
  newsImages: string[]
  createdAt?: string
  lastUpdate?: string
  updatedBy?: string
}

export interface vacancyContacts {
  whatsapp: string
  telegram: string
  email: string
}

export interface Vacancy extends Document {
  companyName: string
  companyLogo: string
  salary: string
  requirements: string
  position: string
  contacts: vacancyContacts[]
  createdAt?: string
  lastUpdate?: string
  updatedBy?: string
}

export interface Token {
  user: Schema.Types.ObjectId
  refreshToken: string
}

export interface reqUser extends User {
  id: string
}

// @ts-expect-error
export interface RequestForMulter extends Request {
  files: {
    newsImages: undefined | Express.Multer.File[]
    posters: undefined | Express.Multer.File[]
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user: reqUser // Replace 'User' with your actual user type
    }
  }
}

export enum CollectionNames {
  USER = 'User',
  TOKEN = 'Token',
  NEWS = 'News',
  VACANCY = 'Vacancy'
}

export enum ImageFolders {
  AVATARS = 'avatars',
  NEWS_IMAGES = 'newsImages',
  POSTERS = 'posters',
  COMPANY_LOGOS = 'companyLogos'
}

export enum Errors {
  VALIDATE_ERROR = 'Validation error',
  AUTH_USER_EXIST = 'User already exist',
  AUTH_ERROR = 'User not authorized',
  AUTH_PERMISSION_DENIED = 'You are not a admin',
  UNEXPECTED_ERROR = 'Unexpected error',
  INVALID_ACTIVATION_LINK = 'Invalid activation link',
  USER_NOT_FOUND = 'User not found',
  EMAIL_IS_ACTIVATED = 'Email is not activated',
  INCORRECT_PASSWORD = 'Incorrect password',
  PASSWORD_ARE_NOT_EQUAL = 'New password and confirm new password are not equal',
  OTP_INCORRECT = 'Otp code are not correct',
  OTP_DID_NOT_SEND = 'You did not send opt code, please send firstly',
  NEWS_NOT_FOUND = 'News not found',
  VACANCY_NOT_FOUND = 'Vacancy not found',
  POSTER_REQUIRED = 'Poster required',
  LOGO_REQUIRED = 'Logo required'
}

export enum Success {
  REGISTERED = 'User successful registered',
  LOGOUT = 'You successful logout',
  PASSWORD_CHANGED = 'Password successful changed',
  PASSWORD_RECOVERED = 'Password successful recovered',
  OTP_SENT = 'Code successful sent',
  OTP_RESENT = 'Code successful resent',
  NEWS_DELETED = 'News successful deleted',
  NEWS_CREATED = 'News successful created',
  NEWS_UPDATED = 'News successful updated',
  USER_UPDATED = 'User successful updated',
  VACANCY_DELETED = 'Vacancy successful deleted',
  VACANCY_CREATED = 'Vacancy successful created',
  VACANCY_UPDATED = 'Vacancy successful updated',
}

export enum ValidationMessages {
  IS_STRING = 'It must be string',
  EMAIL_MESSAGE = 'Write correct email',
  PASSWORD_MESSAGE = 'Password must be min 3 length, max 32',
  NAME_SURNAME_MESSAGE = 'Name must be min 3 length, max 32',
  ID_LENGTH_MESSAGE = 'Id length must be 24',
  ID_REGEX_MESSAGE = 'Id must be match to (/^[0-9a-fA-F]{24}$/)',
  PASSWORD_EQUAL = 'Password need to be equal',
}