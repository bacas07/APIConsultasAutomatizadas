import { Router, Request, Response, NextFunction } from 'express';
import ReportHistoryController from '../controllers/reportHistory.controller.js';
import { authorize } from '../middlewares/role.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const ReportHistoryRouter = Router();

ReportHistoryRouter.get(
  '/:id',
  authenticate,
  authorize(['Admin', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ReportHistoryController.getReportRecordById(req, res, next);
  }
);

ReportHistoryRouter.get(
  '/',
  authenticate,
  authorize(['Admin', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ReportHistoryController.getAllReportRecords(req, res, next);
  }
);

ReportHistoryRouter.get(
  '/scheduled/:scheduledQueryId',
  authenticate,
  authorize(['Admin', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ReportHistoryController.getReportRecordsByScheduledQuery(req, res, next);
  }
);

export default ReportHistoryRouter;
