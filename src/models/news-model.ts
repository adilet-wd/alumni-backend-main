import { Schema, model } from 'mongoose';
import { type News, CollectionNames } from '../types/global';

const schema = new Schema<News>({
  title: { type: String, required: true },
  poster: { type: String, required: true },
  shortDescribe: { type: String, required: true },
  content: [
    {
      title: { type: String },
      paragraph: { type: String }
    }
  ],
  newsImages: [{ type: String }],
  createdAt: { type: String, default: new Date().toISOString(), immutable: true },
  lastUpdate: { type: String, default: null },
  updatedBy: { type: String, default: 'Not updated yet' }
});

export const NewsModel = model(CollectionNames.NEWS, schema);