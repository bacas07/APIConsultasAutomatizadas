import { QueryResultHistoryModel } from '../schemas/queryResultHistory.schema.js';
import type { QueryResultHistoryMongoose } from '../types/types.js';

class QueryResultHistoryLogicService {
  private queryResultHistoryModel = QueryResultHistoryModel;

  async getAllResults(): Promise<QueryResultHistoryMongoose[]> {
    return this.queryResultHistoryModel.find();
  }

  async getResultById(id: string): Promise<QueryResultHistoryMongoose | null> {
    return this.queryResultHistoryModel.findById(id);
  }

  async getResultsByScheduledQueryId(
    id: string
  ): Promise<QueryResultHistoryMongoose[]> {
    return this.queryResultHistoryModel.find({ scheduledQueryId: id });
  }
}

export default new QueryResultHistoryLogicService();
