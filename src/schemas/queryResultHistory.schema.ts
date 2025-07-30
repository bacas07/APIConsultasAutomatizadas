import { Schema, model, Types } from 'mongoose';
import type { QueryResultHistoryMongoose } from '../types/types.js';

const QueryResultHistorySchema = new Schema<QueryResultHistoryMongoose>(
  {
    scheduledQueryId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduledQuery',
      required: true,
    },
    executionTime: { type: Date, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    result: { type: Schema.Types.Mixed, required: false },
    errorMessage: { type: String, required: false },
    executedQuerySql: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const QueryResultHistoryModel = model<QueryResultHistoryMongoose>(
  'QueryResultHistory',
  QueryResultHistorySchema,
  'QueryResultHistory'
);
