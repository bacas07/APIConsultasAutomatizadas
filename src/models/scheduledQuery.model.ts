import { ScheduledQueryModel } from '../schemas/scheduledQuery.schema.js';
import QueryTemplateModel from '../models/queryTemplate.model.js';
import type {
  ScheduledQuery,
  ScheduledQueryMongoose,
  QueryResultHistoryMongoose,
} from '../types/types.js';
import ApiError from '../errors/error.js';

class ScheduledQueryLogicService {
  private scheduledQueryModel = ScheduledQueryModel;
  private queryTemplateModel = QueryTemplateModel;

  async createScheduledQuery(
    data: ScheduledQuery
  ): Promise<ScheduledQueryMongoose> {
    const templateExists = await this.queryTemplateModel.getById(
      data.queryTemplateId.toString()
    );
    if (!templateExists) {
      throw new ApiError(
        `La plantilla de consulta con ID ${data.queryTemplateId} no existe.`,
        404
      );
    }
    return this.scheduledQueryModel.create(data);
  }

  async getScheduledQueryById(
    id: string
  ): Promise<ScheduledQueryMongoose | null> {
    return this.scheduledQueryModel.findById(id);
  }

  async getAllScheduledQueries(): Promise<ScheduledQueryMongoose[]> {
    return this.scheduledQueryModel.find();
  }

  async updateScheduledQuery(
    id: string,
    data: Partial<ScheduledQuery>
  ): Promise<ScheduledQueryMongoose | null> {
    if (data.queryTemplateId) {
      const templateExists = await this.queryTemplateModel.getById(
        data.queryTemplateId.toString()
      );
      if (!templateExists) {
        throw new ApiError(
          `La plantilla de consulta con ID ${data.queryTemplateId} no existe.`,
          404
        );
      }
    }
    return this.scheduledQueryModel.findByIdAndUpdate(id, data);
  }

  async deleteScheduledQuery(
    id: string
  ): Promise<ScheduledQueryMongoose | null> {
    return this.scheduledQueryModel.findByIdAndDelete(id);
  }

  /*
  async runScheduledQueryNow(id: string): Promise<QueryResultHistoryMongoose> {
    const { executeSingleScheduledQuery } = await import(
      './scheduler.service.js'
    );
    return executeSingleScheduledQuery(id);
  }
*/
}

export default new ScheduledQueryLogicService();
