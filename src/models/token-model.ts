import { Schema, model } from 'mongoose';
import { CollectionNames, type Token } from '../types/global';

const schema = new Schema<Token>({
  user: { type: Schema.Types.ObjectId, ref: CollectionNames.USER },
  refreshToken: { type: String, required: true }
});

export const TokenModel = model(CollectionNames.TOKEN, schema);