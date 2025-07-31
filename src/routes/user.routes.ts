import { Router, Request, Response, NextFunction } from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const UserRouter = Router();

UserRouter.get(
  '/:id',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    UserController.getUserById(req, res, next);
  }
);

UserRouter.get(
  '/',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    UserController.getAllUsers(req, res, next);
  }
);

UserRouter.put(
  '/:id',
  authenticate,
  authorize(['Admin']),
  (req: Request, res: Response, next: NextFunction) => {
    UserController.updateUser(req, res, next);
  }
);

export default UserRouter;
