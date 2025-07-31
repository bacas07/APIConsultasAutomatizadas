import { Router, Request, Response, NextFunction } from 'express';
import DatabaseConnectionController from '../controllers/databaseConnection.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const DatabaseConnectionRouter = Router();

DatabaseConnectionRouter.get(
  '/',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.getAllConnections(req, res, next);
  }
);

DatabaseConnectionRouter.get(
  '/:id',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.getConnectionById(req, res, next);
  }
);

DatabaseConnectionRouter.post(
  '/',
  authenticate,
  authorize(['Admin', 'Client', 'User']),
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.createConnection(req, res, next);
  }
);

DatabaseConnectionRouter.put(
  '/:id',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.updateConnection(req, res, next);
  }
);

DatabaseConnectionRouter.delete(
  '/:id',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    DatabaseConnectionController.deleteConnection(req, res, next);
  }
);

export default DatabaseConnectionRouter;
