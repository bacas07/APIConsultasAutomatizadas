import { Request, Response, NextFunction } from 'express';
import QueryTemplateService from '../models/queryTemplate.model.js';
import ApiError from '../errors/error.js';

class QueryTemplateController {
  async getAllQueryTemplates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryTemplates = await QueryTemplateService.getAll();
      res.status(200).json(queryTemplates);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener plantillas de consulta.',
          500
        )
      );
    }
  }

  async getQueryTemplateById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const queryTemplate = await QueryTemplateService.getById(id);
      res.status(200).json(queryTemplate);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al obtener la plantilla de consulta.',
          500
        )
      );
    }
  }

  async createQueryTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newQueryTemplate = await QueryTemplateService.createOne(req.body);
      res.status(201).json(newQueryTemplate);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al crear la plantilla de consulta.',
          500
        )
      );
    }
  }

  async updateQueryTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedQueryTemplate = await QueryTemplateService.updateById(
        id,
        req.body
      );
      res.status(200).json(updatedQueryTemplate);
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al actualizar la plantilla de consulta.',
          500
        )
      );
    }
  }

  async deleteQueryTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await QueryTemplateService.deleteById(id);
      res.status(204).send();
    } catch (error: any) {
      if (error instanceof ApiError) return next(error);
      next(
        new ApiError(
          'Error interno del servidor al eliminar la plantilla de consulta.',
          500
        )
      );
    }
  }
}

export default new QueryTemplateController();
