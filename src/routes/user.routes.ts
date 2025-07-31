// src/routes/user.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import UserController from '../controllers/user.controller.js';

const UserRouter = Router();

UserRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  UserController.getUserById(req, res, next);
});

UserRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  UserController.getAllUsers(req, res, next);
});

UserRouter.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  UserController.updateUser(req, res, next);
});

export default UserRouter;
