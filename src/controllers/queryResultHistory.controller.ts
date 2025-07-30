import { Request, Response, NextFunction } from 'express';
import QueryResultHistoryService from '../models/queryResultHistory.model.js';
import ApiError from '../errors/error.js';

class QueryResultHistoryController {
  async getAllHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const history = await QueryResultHistoryService.getAll();
      res.status(200).json(history);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener el historial de resultados.',
          500
        )
      );
    }
  }

  async getHistoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const historyEntry = await QueryResultHistoryService.getById(id);
      res.status(200).json(historyEntry);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener la entrada del historial.',
          500
        )
      );
    }
  }

  async getHistoryByScheduledQueryId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { scheduledQueryId } = req.params;
      const historyEntries =
        await QueryResultHistoryService.getResultsByScheduledQueryId(
          scheduledQueryId
        );
      res.status(200).json(historyEntries);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener historial por ID de consulta programada.',
          500
        )
      );
    }
  }
}

export default new QueryResultHistoryController();
