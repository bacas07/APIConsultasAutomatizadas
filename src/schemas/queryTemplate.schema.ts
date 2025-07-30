import { Schema, model } from 'mongoose';
import { QueryTemplateMongoose } from '../types/types.js';

const QueryTemplateSchema = new Schema<QueryTemplateMongoose>(
  {
    name: {
      type: String,
      required: true,

      querySql: { type: String, required: true },
      parameters: [
        {
          name: { type: String, required: true },
          type: { type: String, required: true },
        },
      ],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QueryTemplateModel = model<QueryTemplateMongoose>(
  'QueryTemplate',
  QueryTemplateSchema,
  'QueryTemplate'
);
