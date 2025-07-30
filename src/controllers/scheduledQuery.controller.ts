import { Request, Response, NextFunction } from 'express';
import ScheduledQueryService from '../models/scheduledQuery.model.js';
import ApiError from '../errors/error.js';
import mainSchedulerService from '../services/mainScheduler.service.js';

class ScheduledQueryController {
  async getAllScheduledQueries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const scheduledQueries = await ScheduledQueryService.getAll();
      res.status(200).json(scheduledQueries);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener consultas programadas.',
          500
        )
      );
    }
  }

  async getScheduledQueryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const scheduledQuery = await ScheduledQueryService.getById(id);
      res.status(200).json(scheduledQuery);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener la consulta programada.',
          500
        )
      );
    }
  }

  async createScheduledQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newScheduledQuery = await ScheduledQueryService.createOne(req.body);
      await mainSchedulerService.start();
      res.status(201).json(newScheduledQuery);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al crear la consulta programada.',
          500
        )
      );
    }
  }

  async updateScheduledQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedScheduledQuery = await ScheduledQueryService.updateById(
        id,
        req.body
      );
      await mainSchedulerService.start();
      res.status(200).json(updatedScheduledQuery);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al actualizar la consulta programada.',
          500
        )
      );
    }
  }

  async deleteScheduledQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await ScheduledQueryService.deleteById(id);
      await mainSchedulerService.start();
      res.status(204).send();
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al eliminar la consulta programada.',
          500
        )
      );
    }
  }
}

export default new ScheduledQueryController();
