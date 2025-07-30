import { Document, Types } from 'mongoose';

export interface DatabaseConnection {
  name: string;
  type: 'postgresql' | 'mysql' | 'mssql' | 'oracle' | 'other';
}

export interface DatabaseConnectionMongoose
  extends DatabaseConnection,
    Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryTemplate {
  name: string;
  querySql: string;
  parameters: [
    {
      name: string;
      type: string;
    },
  ];
  databaseConnectionId: Types.ObjectId;
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

export interface ScheduledQueryMongoose extends ScheduledQuery, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryResultHistory {
  scheduledQueryId: Types.ObjectId;
  executionTime: Date;
  status: 'success' | 'failed';
  result: any;
  errorMessage?: string;
  executedQuerySql: string;
}

export interface QueryResultHistoryMongoose
  extends QueryResultHistory,
    Document {
  createdAt: Date;
  updatedAt: Date;
}
