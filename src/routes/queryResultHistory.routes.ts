import { Router, Request, Response, NextFunction } from 'express';
import QueryResultHistoryController from '../controllers/queryResultHistory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const QueryResultHistoryRouter = Router();

QueryResultHistoryRouter.get(
  '/',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryResultHistoryController.getAllHistory(req, res, next);
  }
);

QueryResultHistoryRouter.get(
  '/:id',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryResultHistoryController.getHistoryById(req, res, next);
  }
);

QueryResultHistoryRouter.get(
  '/scheduled-query/:scheduledQueryId',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryResultHistoryController.getHistoryByScheduledQueryId(req, res, next);
  }
);

export default QueryResultHistoryRouter;
