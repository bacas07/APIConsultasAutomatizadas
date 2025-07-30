import { Document } from 'mongoose';

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
