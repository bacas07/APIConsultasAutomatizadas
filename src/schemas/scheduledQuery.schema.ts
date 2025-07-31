import mongoose, { Schema, Document, Types } from 'mongoose';
import { ScheduledQueryMongoose, ScheduledQuery } from '../types/types.js';

const ScheduledQuerySchema: Schema = new Schema<ScheduledQuery>(
  {
    name: { type: String, required: true },
    queryTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'QueryTemplate',
      required: true,
    },
    parametersValues: [
      {
        name: { type: String, required: true },
        value: { type: Schema.Types.Mixed },
      },
    ],
    cronExpression: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastExecutionTime: { type: Date, default: null },
    nextExecutionTime: { type: Date, default: null },
    reportConfig: {
      type: {
        format: { type: String, enum: ['CSV'], required: true },
        emailRecipients: [{ type: String, required: true }],
        emailSubjectTemplate: { type: String },
        emailBodyTemplate: { type: String },
        fileNameTemplate: { type: String },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ScheduledQueryModel = mongoose.model<ScheduledQueryMongoose>(
  'ScheduledQuery',
  ScheduledQuerySchema
);

export default ScheduledQueryModel;
