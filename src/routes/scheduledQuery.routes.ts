import { Router, Request, Response, NextFunction } from 'express';
import ScheduledQueryController from '../controllers/scheduledQuery.controller.js';

const ScheduledQueryRouter = Router();

ScheduledQueryRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.getAllScheduledQueries(req, res, next);
  }
);

ScheduledQueryRouter.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.getScheduledQueryById(req, res, next);
  }
);

ScheduledQueryRouter.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.createScheduledQuery(req, res, next);
  }
);

ScheduledQueryRouter.put(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.updateScheduledQuery(req, res, next);
  }
);

ScheduledQueryRouter.delete(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.deleteScheduledQuery(req, res, next);
  }
);

export default ScheduledQueryRouter;