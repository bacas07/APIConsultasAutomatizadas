import { Document, Types } from 'mongoose';

export interface QueryTemplate {
  name: string;
  querySql: string;
  parameters: [
    {
      name: string;
      type: string;
    },
  ];
}

export interface QueryTemplateMongoose extends QueryTemplate, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledQuery {
  queryTemplateId: Types.ObjectId;
  schedule: string;
  nextExecutionTime: Date;
  isActive: boolean;
  parametersValues: [
    {
      name: string;
      value: any;
    },
  ];
}

