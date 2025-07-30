// src/models/databaseConnection.model.ts
import { DatabaseConnectionModel } from '../schemas/databaseConnection.schema.js';
import type { DatabaseConnection, DatabaseConnectionMongoose } from '../types/types.js';
import ApiError from '../errors/error.js';
import { Types } from 'mongoose';

class DatabaseConnectionService {
    private model = DatabaseConnectionModel;

    async getAll(): Promise<DatabaseConnectionMongoose[]> {
        try {
            const connections = await this.model.find();
            return connections;
        } catch (error) {
            throw new ApiError('Error interno al recuperar conexiones de base de datos.', 500);
        }
    }

    async getById(id: string): Promise<DatabaseConnectionMongoose | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ApiError(`ID de conexión de base de datos inválido: ${id}`, 400);
            }
            const connection = await this.model.findById(id);
            if (!connection) {
                throw new ApiError(`Conexión de base de datos con ID ${id} no encontrada.` + 'error en dbConnectionService', 404);
            }
            return connection;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('Error interno al recuperar la conexión de base de datos.', 500);
        }
    }

    async createOne(data: DatabaseConnection): Promise<DatabaseConnectionMongoose> {
        try {
            const connection = await this.model.create(data);
            return connection;
        } catch (error: any) {
            console.error('Error al crear conexión de base de datos:', error);
            if (error.code === 11000) {
                throw new ApiError('Ya existe una conexión de base de datos con este nombre.', 409);
            }
            if (error instanceof ApiError) throw error;
            throw new ApiError('Error interno al crear la conexión de base de datos.', 500);
        }
    }

    async updateById(id: string, data: Partial<DatabaseConnection>): Promise<DatabaseConnectionMongoose | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ApiError(`ID de conexión de base de datos inválido: ${id}`, 400);
            }
            const connection = await this.model.findByIdAndUpdate(id, data, { new: true });
            if (!connection) {
                throw new ApiError(`No se encontró conexión de base de datos con ID: ${id} para actualizar.`, 404);
            }
            return connection;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('Error interno al actualizar la conexión de base de datos.', 500);
        }
    }

    async deleteById(id: string): Promise<DatabaseConnectionMongoose | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new ApiError(`ID de conexión de base de datos inválido: ${id}`, 400);
            }
            const connection = await this.model.findByIdAndDelete(id);
            if (!connection) {
                throw new ApiError(`No se encontró conexión de base de datos con ID: ${id} para eliminar.`, 404);
            }
            return connection;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('Error interno al eliminar la conexión de base de datos.', 500);
        }
    }
}

export default new DatabaseConnectionService();