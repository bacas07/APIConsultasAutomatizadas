import { QueryResultHistoryModel } from '../schemas/queryResultHistory.schema.js';
import type {
  QueryResultHistory,
  QueryResultHistoryMongoose,
} from '../types/types.js';
import ApiError from '../errors/error.js';
import { Types } from 'mongoose';

class QueryResultHistoryService {
  private model = QueryResultHistoryModel;

  async getAll(): Promise<QueryResultHistoryMongoose[]> {
    try {
      const results = await this.model.find().populate({
        path: 'scheduledQueryId',
        populate: {
          path: 'queryTemplateId',
        },
      });
      return results;
    } catch (error) {
      throw new ApiError(
        'Error interno al recuperar el historial de resultados.',
        500
      );
    }
  }

  async getById(id: string): Promise<QueryResultHistoryMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de historial de resultado inválido: ${id}`, 400);
      }
      const result = await this.model.findById(id).populate({
        path: 'scheduledQueryId',
        populate: {
          path: 'queryTemplateId',
        },
      });
      if (!result) {
        throw new ApiError(
          `No se encontró historial de resultado con ID: ${id}`,
          404
        );
      }
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al recuperar el historial de resultado.',
        500
      );
    }
  }

  async getResultsByScheduledQueryId(
    scheduledQueryId: string
  ): Promise<QueryResultHistoryMongoose[]> {
    try {
      if (!Types.ObjectId.isValid(scheduledQueryId)) {
        throw new ApiError(
          `ID de consulta programada inválido: ${scheduledQueryId}`,
          400
        );
      }
      const results = await this.model.find({ scheduledQueryId }).populate({
        path: 'scheduledQueryId',
        populate: {
          path: 'queryTemplateId',
        },
      });
      return results;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al recuperar el historial de resultados por ID de consulta programada.',
        500
      );
    }
  }

  async createOne(
    data: QueryResultHistory
  ): Promise<QueryResultHistoryMongoose> {
    try {
      if (!Types.ObjectId.isValid(data.scheduledQueryId)) {
        throw new ApiError(
          `ID de consulta programada inválido: ${data.scheduledQueryId}`,
          400
        );
      }

      const result = await this.model.create(data);
      return await result.populate({
        path: 'scheduledQueryId',
        populate: {
          path: 'queryTemplateId',
        },
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al crear el historial de resultado.',
        500
      );
    }
  }
}

export default new QueryResultHistoryService();
