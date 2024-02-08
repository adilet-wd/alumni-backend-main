import { Schema, model } from 'mongoose';
import { type User, CollectionNames } from '../types/global';

const schema = new Schema<User>({
  email: { type: String, unique: true, required: true, immutable: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  activationLink: { type: String },
  resetCode: { type: Number, length: 6, default: null },
  phoneNumber: { type: String, required: true },
  // @ts-expect-error
  education: { type: String, default: null, required: false, enum: Object.values(['Среднее-Профессиональное', 'Бакалавриат', 'Магистратура', 'Докторантура', 'Аспирантура']).concat([null]) },
  place: { type: String, default: null },
  educationAndGoals: { type: String, default: null },
  positionAtWork: { type: String, default: null },
  shortBiography: { type: String, default: null },
  // @ts-expect-error
  specialty: { type: String, default: null, required: false, enum: Object.values(['Программист', 'Врач', 'Психолог', 'Переводчик']).concat([null]) },
  workPlace: { type: String, default: null },
  avatar: { type: String, default: null },
  yearOfRelease: { type: Number, length: 4, default: null },
  createdAt: { type: String, default: new Date().toISOString(), immutable: true }
});

export const UserModel = model(CollectionNames.USER, schema);