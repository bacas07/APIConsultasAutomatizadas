import { Router, Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth.controller.js';

const AuthRouter = Router();

AuthRouter.post(
  '/register',
  (req: Request, res: Response, next: NextFunction) => {
    AuthController.register(req, res, next);
  }
);

AuthRouter.post('/login', (req: Request, res: Response, next: NextFunction) => {
  AuthController.login(req, res, next);
});

export default AuthRouter;
