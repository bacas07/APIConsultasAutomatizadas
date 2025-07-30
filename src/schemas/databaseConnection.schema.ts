import { Schema, model } from 'mongoose';
import type { DatabaseConnectionMongoose } from '../types/types.js';

const DatabaseConnectionSchema = new Schema<DatabaseConnectionMongoose>(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['postgresql', 'mysql', 'mssql', 'oracle', 'other'],
      required: true,
    },
    connectionString: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const DatabaseConnectionModel = model<DatabaseConnectionMongoose>(
  'DatabaseConnection',
  DatabaseConnectionSchema,
  'DatabaseConnection'
);
