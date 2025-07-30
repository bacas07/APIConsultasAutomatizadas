import { Schema, model, Types } from 'mongoose';
import type { ScheduledQueryMongoose } from '../types/types.js';

const ScheduledQuerySchema = new Schema<ScheduledQueryMongoose>(
  {
    queryTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryTemplate',
      required: true,
    },
    nextExecutionTime: { type: Date },
    isActive: { type: Boolean, default: true },
    parametersValues: [
      {
        name: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],
    lastExecutionTime: {
      type: Date,
    },
    cronExpression: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ScheduledQueryModel = model<ScheduledQueryMongoose>(
  'ScheduledQuery',
  ScheduledQuerySchema,
  'ScheduledQueries'
);
