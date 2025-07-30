import { QueryTemplateModel } from '../schemas/queryTemplate.schema.js';
import type { QueryTemplate, QueryTemplateMongoose } from '../types/types.js';
import ApiError from '../errors/error.js';
import { Types } from 'mongoose';

class QueryTemplateService {
  private model = QueryTemplateModel;

  async getAll(): Promise<QueryTemplateMongoose[]> {
    try {
      const query = await this.model.find();
      return query;
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string): Promise<QueryTemplateMongoose | null> {
    try {
      const query = await this.model.findById(id);
      if (!query) {
        throw new ApiError(`ID de plantilla de consulta inválido: ${id}`, 400);
      }
      return query;
    } catch (error) {
      throw error;
    }
  }

  async createOne(data: QueryTemplate): Promise<QueryTemplateMongoose> {
    try {
      const query = await this.model.create(data);
      return query;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(
          'Ya existe una plantilla de consulta con este nombre.',
          409
        );
      }
      throw error;
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
      const query = await this.model.findByIdAndUpdate(id, data, { new: true });
      if (!query) {
        throw new ApiError(
          `No se encontró plantilla de consulta con ID: ${id} para actualizar.`,
          404
        );
      }
      return query;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }
}

export default new QueryTemplateService();
