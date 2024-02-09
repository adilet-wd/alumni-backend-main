import { Schema, model } from 'mongoose';
import { type Vacancy, CollectionNames } from '../types/global';

const schema = new Schema<Vacancy>({
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: true },
  salary: { type: String, required: true },
  requirements: { type: String, required: true },
  position: { type: String, required: true },
  contacts: [
    {
      whatsapp: { type: String },
      telegram: { type: String },
      email: { type: String }
    }
  ],
  createdAt: { type: String, default: new Date().toISOString(), immutable: true },
  lastUpdate: { type: String, default: null },
  updatedBy: { type: String, default: 'Not updated yet' }
});

export const VacancyModel = model(CollectionNames.VACANCY, schema);