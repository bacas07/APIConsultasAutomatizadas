import { Router, Request, Response, NextFunction } from 'express';
import DatabaseConnectionController from '../controllers/databaseConnection.controller.js';

const DatabaseConnectionRouter = Router();

DatabaseConnectionRouter.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.getAllConnections(req, res, next);
  }
);

DatabaseConnectionRouter.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.getConnectionById(req, res, next);
  }
);

DatabaseConnectionRouter.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.createConnection(req, res, next);
  }
);

DatabaseConnectionRouter.put(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.updateConnection(req, res, next);
  }
);

DatabaseConnectionRouter.delete(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.deleteConnection(req, res, next);
  }
);

export default DatabaseConnectionRouter;