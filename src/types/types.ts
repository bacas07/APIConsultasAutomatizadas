import { Document, Types } from 'mongoose';

export type UserRole = 'Admin' | 'Client' | 'User';

export interface IUser {
  username: string;
  password?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMongoose extends IUser, Document {}

export interface DatabaseConnection {
  name: string;
  type: 'postgresql' | 'mysql';
  connectionString: string;
}

export interface DatabaseConnectionMongoose
  extends DatabaseConnection,
    Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryParameter {
  name: string;
  type: string;
  defaultValue?: any;
}

export interface QueryTemplate {
  name: string;
  description?: string;
  querySql: string;
  parameters: QueryParameter[];
  databaseConnectionId: Types.ObjectId | DatabaseConnectionMongoose;
}

export interface QueryTemplateMongoose extends QueryTemplate, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportConfig {
  format: 'CSV';
  emailRecipients: string[];
  emailSubjectTemplate?: string;
  emailBodyTemplate?: string;
  fileNameTemplate?: string;
}

export interface ScheduledQuery {
  name?: string;
  queryTemplateId: Types.ObjectId | QueryTemplateMongoose;
  parametersValues: Array<{ name: string; value: any }>;
  cronExpression: string;
  isActive: boolean;
  lastExecutionTime?: Date;
  nextExecutionTime?: Date;
  reportConfig?: ReportConfig;
}

export interface ScheduledQueryMongoose extends ScheduledQuery, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQueryResultHistory {
  scheduledQueryId: Types.ObjectId;
  executionTime: Date;
  status: 'success' | 'failed';
  result: any;
  errorMessage?: string;
  executedQuerySql: string;
}

export interface QueryResultHistoryMongoose
  extends IQueryResultHistory,
    Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportHistory {
  scheduledQueryId?: Types.ObjectId;
  queryTemplateId?: Types.ObjectId | unknown;
  generatedAt: Date;
  status: 'success' | 'failed';
  fileName: string;
  fileSizeKB?: number;
  recipients: string[];
  emailStatus: 'sent' | 'failed' | 'not_applicable';
  errorMessage?: string;
  associatedQueryResultId?: Types.ObjectId;
}

export interface ReportHistoryMongoose extends IReportHistory, Document {
}
