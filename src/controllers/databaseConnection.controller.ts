import { Request, Response, NextFunction } from 'express';
import DatabaseConnectionService from '../models/databaseConnection.model.js';
import ApiError from '../errors/error.js';

class DatabaseConnectionController {
  async getAllConnections(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const connections = await DatabaseConnectionService.getAll();
      res.status(200).json(connections);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError('Error interno del servidor al obtener conexiones.', 500)
      );
    }
  }

  async getConnectionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const connection = await DatabaseConnectionService.getById(id);
      res.status(200).json(connection);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError('Error interno del servidor al obtener la conexión.', 500)
      );
    }
  }

  async createConnection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newConnection = await DatabaseConnectionService.createOne(req.body);
      res.status(201).json(newConnection);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError('Error interno del servidor al crear la conexión.', 500)
      );
    }
  }

  async updateConnection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedConnection = await DatabaseConnectionService.updateById(
        id,
        req.body
      );
      res.status(200).json(updatedConnection);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al actualizar la conexión.',
          500
        )
      );
    }
  }

  async deleteConnection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await DatabaseConnectionService.deleteById(id);
      res.status(204).send();
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError('Error interno del servidor al eliminar la conexión.', 500)
      );
    }
  }
}

export default new DatabaseConnectionController();
