import { QueryTemplateModel } from '../schemas/queryTemplate.schema.js';
import type { QueryTemplate, QueryTemplateMongoose } from '../types/types.js';
import ApiError from '../errors/error.js';
import { Types } from 'mongoose';
import DatabaseConnectionService from './databaseConnection.model.js';

class QueryTemplateService {
  private model = QueryTemplateModel;

  async getAll(): Promise<QueryTemplateMongoose[]> {
    try {
      const query = await this.model.find().populate('databaseConnectionId');
      return query;
    } catch (error) {
      throw new ApiError(
        'Error interno al recuperar plantillas de consulta.',
        500
      );
    }
  }

  async getById(id: string): Promise<QueryTemplateMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de plantilla de consulta inválido: ${id}`, 400);
      }
      const query = await this.model
        .findById(id)
        .populate('databaseConnectionId');
      if (!query) {
        throw new ApiError(
          `No se encontró plantilla de consulta con ID: ${id}`,
          404
        );
      }
      return query;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al recuperar la plantilla de consulta.',
        500
      );
    }
  }

  async createOne(data: QueryTemplate): Promise<QueryTemplateMongoose> {
    try {
      if (!Types.ObjectId.isValid(data.databaseConnectionId)) {
        throw new ApiError(
          `ID de conexión de base de datos inválido: ${data.databaseConnectionId}`,
          400
        );
      }

      const dbConnection = await DatabaseConnectionService.getById(
        data.databaseConnectionId.toString()
      );
      if (!dbConnection) {
        throw new ApiError(
          `La conexión de base de datos con ID ${data.databaseConnectionId} no existe.`,
          404
        );
      }

      const query = await this.model.create(data);
      return await query.populate('databaseConnectionId');
    } catch (error: any) {
      console.error('Error al crear plantilla de consulta:', error);
      if (error.code === 11000) {
        throw new ApiError(
          'Ya existe una plantilla de consulta con este nombre.',
          409
        );
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al crear la plantilla de consulta.',
        500
      );
    }
  }

  async updateById(
    id: string,
    data: Partial<QueryTemplate>
  ): Promise<QueryTemplateMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de plantilla de consulta inválido: ${id}`, 400);
      }

      if (data.databaseConnectionId) {
        if (!Types.ObjectId.isValid(data.databaseConnectionId)) {
          throw new ApiError(
            `ID de conexión de base de datos inválido: ${data.databaseConnectionId}`,
            400
          );
        }
        const dbConnection = await DatabaseConnectionService.getById(
          data.databaseConnectionId.toString()
        );
        if (!dbConnection) {
          throw new ApiError(
            `La nueva conexión de base de datos con ID ${data.databaseConnectionId} no existe.`,
            404
          );
        }
      }

      const query = await this.model
        .findByIdAndUpdate(id, data, { new: true })
        .populate('databaseConnectionId');
      if (!query) {
        throw new ApiError(
          `No se encontró plantilla de consulta con ID: ${id} para actualizar.`,
          404
        );
      }
      return query;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al actualizar la plantilla de consulta.',
        500
      );
    }
  }

  async deleteById(id: string): Promise<QueryTemplateMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de plantilla de consulta inválido: ${id}`, 400);
      }
      const query = await this.model.findByIdAndDelete(id);
      if (!query) {
        throw new ApiError(
          `No se encontró plantilla de consulta con ID: ${id} para eliminar.`,
          404
        );
      }
      return query;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al eliminar la plantilla de consulta.',
        500
      );
    }
  }
}

export default new QueryTemplateService();
