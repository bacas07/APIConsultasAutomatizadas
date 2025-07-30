import { Schema, model, Types } from 'mongoose';
import type { ScheduledQueryMongoose } from '../types/types.js';

const ScheduledQuerySchema = new Schema<ScheduledQueryMongoose>(
  {
    queryTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryTemplate',
      required: true,
    },
    schedule: { type: String, required: true },
    nextExecutionTime: { type: Date, required: true },
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
      type: Date,
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
