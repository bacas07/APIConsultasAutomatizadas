import { Request, Response, NextFunction } from 'express';
import ReportHistoryService from '../models/reportHistory.model.js';
import ApiError from '../errors/error.js';
import { IReportHistory } from '../types/types.js';

class ReportHistoryController {
  public async createReportRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reportData: IReportHistory = req.body;
      const newRecord =
        await ReportHistoryService.createReportRecord(reportData);
      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  }

  public async getReportRecordById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await ReportHistoryService.getReportRecordById(
        req.params.id
      );
      if (!record) {
        throw new ApiError(
          'Registro de historial de reporte no encontrado.',
          404
        );
      }
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  }

  public async getAllReportRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const records = await ReportHistoryService.getAllReportRecords();
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  }

  public async getReportRecordsByScheduledQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const records =
        await ReportHistoryService.getReportRecordsByScheduledQuery(
          req.params.scheduledQueryId
        );
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportHistoryController();
