import { Schema, model } from 'mongoose';
import { QueryResultHistoryMongoose } from '../types/types.js';

const QueryResultSchema = new Schema<QueryResultHistoryMongoose>({
  scheduledQueryId: { type: Schema.Types.ObjectId, required: true },
  
});

export const QueryResultModel = model<QueryResultHistoryMongoose>(
  'QueryResult',
  QueryResultSchema,
  'QueryResult'
);
