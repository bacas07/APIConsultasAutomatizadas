import { Router, Request, Response, NextFunction } from 'express';
import QueryTemplateController from '../controllers/queryTemplate.controller.js';

const QueryTemplateRouter = Router();

QueryTemplateRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.getAllQueryTemplates(req, res, next);
  }
);

QueryTemplateRouter.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.getQueryTemplateById(req, res, next);
  }
);

QueryTemplateRouter.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.createQueryTemplate(req, res, next);
  }
);

QueryTemplateRouter.put(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.updateQueryTemplate(req, res, next);
  }
);

QueryTemplateRouter.delete(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    QueryTemplateController.deleteQueryTemplate(req, res, next);
  }
);

export default QueryTemplateRouter;
