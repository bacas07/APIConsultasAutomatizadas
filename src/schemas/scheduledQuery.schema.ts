import { Schema, model } from 'mongoose';
import { ScheduledQuery, ScheduledQueryMongoose } from '../types/types.js';

const ScheduleQuerySchema = new Schema<ScheduledQueryMongoose>(
  {
    queryTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryTemplate',
      required: true,
    },
    schedule: {
      type: String,
      required: true,
      nextExecutionTime: { type: Date, required: true },
      isActive: { type: Boolean, default: true },
      parametersValues: [
        {
          name: { type: String, required: true },
          value: { type: Schema.Types.Mixed, required: true },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const ScheduledQueryModel = model<ScheduledQueryMongoose>(
  'ScheduledQuery',
  ScheduleQuerySchema,
  'ScheduledQuery'
);
