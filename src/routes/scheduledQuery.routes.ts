import { Router, Request, Response, NextFunction } from 'express';
import ScheduledQueryController from '../controllers/scheduledQuery.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const ScheduledQueryRouter = Router();

ScheduledQueryRouter.get(
  '/',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.getAllScheduledQueries(req, res, next);
  }
);

ScheduledQueryRouter.get(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.getScheduledQueryById(req, res, next);
  }
);

ScheduledQueryRouter.post(
  '/',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.createScheduledQuery(req, res, next);
  }
);

ScheduledQueryRouter.put(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.updateScheduledQuery(req, res, next);
  }
);

ScheduledQueryRouter.delete(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    ScheduledQueryController.deleteScheduledQuery(req, res, next);
  }
);

export default ScheduledQueryRouter;
