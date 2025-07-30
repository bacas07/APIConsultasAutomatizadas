import { Router, Request, Response, NextFunction } from 'express';
import QueryResultHistoryController from '../controllers/queryResultHistory.controller.js';

const QueryResultHistoryRouter = Router();

QueryResultHistoryRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    QueryResultHistoryController.getAllHistory(req, res, next);
  }
);

QueryResultHistoryRouter.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    QueryResultHistoryController.getHistoryById(req, res, next);
  }
);

QueryResultHistoryRouter.get(
  '/scheduled-query/:scheduledQueryId',
  (req: Request, res: Response, next: NextFunction) => {
    QueryResultHistoryController.getHistoryByScheduledQueryId(req, res, next);
  }
);

export default QueryResultHistoryRouter;