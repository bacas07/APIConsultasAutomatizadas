import { Router, Request, Response, NextFunction } from 'express';
import ReportHistoryController from '../controllers/reportHistory.controller.js';

const ReportHistoryRouter = Router();

ReportHistoryRouter.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    ReportHistoryController.getReportRecordById(req, res, next);
  }
);

ReportHistoryRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    ReportHistoryController.getAllReportRecords(req, res, next);
  }
);

ReportHistoryRouter.get(
  '/scheduled/:scheduledQueryId',
  (req: Request, res: Response, next: NextFunction) => {
    ReportHistoryController.getReportRecordsByScheduledQuery(req, res, next);
  }
);

export default ReportHistoryRouter;
