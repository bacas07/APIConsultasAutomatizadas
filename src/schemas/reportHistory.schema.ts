import mongoose, { Schema, Document, Types } from 'mongoose';
import { IReportHistory, ReportHistoryMongoose } from '../types/types.js';

const ReportHistorySchema: Schema = new Schema<IReportHistory>(
  {
    scheduledQueryId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduledQuery',
      required: false,
    },
    queryTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryTemplate',
      required: false,
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSizeKB: {
      type: Number,
      required: false,
    },
    recipients: [
      {
        type: String,
        required: true,
      },
    ],
    emailStatus: {
      type: String,
      enum: ['sent', 'failed', 'not_applicable'],
      required: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    associatedQueryResultId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryResultHistory',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ReportHistoryModel = mongoose.model<ReportHistoryMongoose>(
  'ReportHistory',
  ReportHistorySchema
);

export default ReportHistoryModel;
