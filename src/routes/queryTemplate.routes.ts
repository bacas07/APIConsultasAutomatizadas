import { Router, Request, Response, NextFunction } from 'express';
import QueryTemplateController from '../controllers/queryTemplate.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const QueryTemplateRouter = Router();

QueryTemplateRouter.get(
  '/',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.getAllQueryTemplates(req, res, next);
  }
);

QueryTemplateRouter.get(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.getQueryTemplateById(req, res, next);
  }
);

QueryTemplateRouter.post(
  '/',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.createQueryTemplate(req, res, next);
  }
);

QueryTemplateRouter.put(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.updateQueryTemplate(req, res, next);
  }
);

QueryTemplateRouter.delete(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.deleteQueryTemplate(req, res, next);
  }
);

export default QueryTemplateRouter;
