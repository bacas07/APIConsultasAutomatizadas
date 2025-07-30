import { ScheduledQueryModel } from '../schemas/scheduledQuery.schema.js';
import type { ScheduledQuery, ScheduledQueryMongoose } from '../types/types.js';
import ApiError from '../errors/error.js';
import { Types } from 'mongoose';
import QueryTemplateService from './queryTemplate.model.js'; // Necesario para validar queryTemplateId

class ScheduledQueryService {
  private readonly model = ScheduledQueryModel;

  async getAll(): Promise<ScheduledQueryMongoose[]> {
    try {
      const scheduledQueries = await this.model
        .find()
        .populate('queryTemplateId');
      return scheduledQueries;
    } catch (error) {
      throw new ApiError(
        'Error interno al recuperar consultas programadas.',
        500
      );
    }
  }

  async getById(id: string): Promise<ScheduledQueryMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de consulta programada inválido: ${id}`, 400);
      }
      const scheduledQuery = await this.model
        .findById(id)
        .populate('queryTemplateId');
      if (!scheduledQuery) {
        throw new ApiError(
          `No se encontró consulta programada con ID: ${id}`,
          404
        );
      }
      return scheduledQuery;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al recuperar la consulta programada.',
        500
      );
    }
  }

  async getActiveAndDue(): Promise<ScheduledQueryMongoose[]> {
    try {
      const now = new Date();
      const activeAndDueQueries = await this.model
        .find({ isActive: true, nextExecutionTime: { $lte: now } })
        .populate('queryTemplateId');

      return activeAndDueQueries;
    } catch (error) {
      throw new ApiError(
        'Error al buscar consultas programadas activas y vencidas.',
        500
      );
    }
  }

  async createOne(scheduledQueryData: any): Promise<any> {
    try {
      // Opcional pero recomendado: Verificar si la queryTemplateId existe
      // Esto convertiría el error 500 en un 404 más específico si ese es el caso.
      const existingTemplate = await QueryTemplateService.getById(
        scheduledQueryData.queryTemplateId
      );
      if (!existingTemplate) {
        throw new ApiError(
          'La plantilla de consulta (queryTemplateId) especificada no existe.',
          404
        );
      }

      // Si no existe, podrías agregar un console.log aquí para ver scheduledQueryData
      // console.log('Datos de scheduledQueryData antes de crear:', scheduledQueryData);

      const newScheduledQuery = new ScheduledQueryModel(scheduledQueryData);
      const savedQuery = await newScheduledQuery.save(); // La línea 67 podría estar aquí o en el constructor si es un error de tipo

      // Si la línea 67 se refiere a la creación del objeto o a .save(),
      // el error original se capturará abajo.

      return savedQuery;
    } catch (error: any) {
      // ¡Aquí es donde vemos el error original!
      console.error(
        'ERROR DETECTADO EN ScheduledQueryService.createOne:',
        error
      );

      if (error.name === 'ValidationError') {
        // Errores de validación de Mongoose
        const messages = Object.values(error.errors).map(
          (val: any) => val.message
        );
        throw new ApiError(`Error de validación: ${messages.join('. ')}`, 400);
      }

      if (error instanceof ApiError) {
        throw error; // Propagar errores ApiError ya definidos (como el 404 de arriba)
      }

      // Error genérico, lo envolvemos en un ApiError
      throw new ApiError(
        'Error interno al crear la consulta programada.',
        500,
        error.message || error
      );
    }
  }

  async updateById(
    id: string,
    data: Partial<ScheduledQuery>
  ): Promise<ScheduledQueryMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de consulta programada inválido: ${id}`, 400);
      }

      if (data.queryTemplateId) {
        if (!Types.ObjectId.isValid(data.queryTemplateId)) {
          throw new ApiError(
            `ID de plantilla de consulta inválido: ${data.queryTemplateId}`,
            400
          );
        }
        const queryTemplate = await QueryTemplateService.getById(
          data.queryTemplateId.toString()
        );
        if (!queryTemplate) {
          throw new ApiError(
            `La nueva plantilla de consulta con ID ${data.queryTemplateId} no existe.`,
            404
          );
        }
      }

      const scheduledQuery = await this.model
        .findByIdAndUpdate(id, data, { new: true })
        .populate('queryTemplateId');
      if (!scheduledQuery) {
        throw new ApiError(
          `No se encontró consulta programada con ID: ${id} para actualizar.`,
          404
        );
      }
      return scheduledQuery;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al actualizar la consulta programada.',
        500
      );
    }
  }

  async deleteById(id: string): Promise<ScheduledQueryMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de consulta programada inválido: ${id}`, 400);
      }
      const scheduledQuery = await this.model.findByIdAndDelete(id);
      if (!scheduledQuery) {
        throw new ApiError(
          `No se encontró consulta programada con ID: ${id} para eliminar.`,
          404
        );
      }
      return scheduledQuery;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al eliminar la consulta programada.',
        500
      );
    }
  }

  async updateNextExecutionTime(
    id: string,
    nextExecutionTime: Date,
    isActive: boolean = true
  ): Promise<ScheduledQueryMongoose | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(`ID de consulta programada inválido: ${id}`, 400);
      }
      const updatedQuery = await this.model.findByIdAndUpdate(
        id,
        { $set: { nextExecutionTime, isActive } },
        { new: true }
      );
      if (!updatedQuery) {
        throw new ApiError(
          `No se encontró consulta programada con ID: ${id} para actualizar nextExecutionTime.`,
          404
        );
      }
      return updatedQuery;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Error interno al actualizar la próxima ejecución de la consulta programada.',
        500
      );
    }
  }
}

export default new ScheduledQueryService();
