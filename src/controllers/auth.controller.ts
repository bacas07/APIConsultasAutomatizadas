import { Request, Response, NextFunction } from 'express';
import AuthService from '../utils/auth.util.js';
import ApiError from '../errors/error.js';

class AuthController {
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, password, role } = req.body;
      const { user, token } = await AuthService.register({
        username,
        password,
        role,
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: user,
        token: token,
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, password } = req.body;
      const { user, token } = await AuthService.login(username, password);

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: user,
        token: token,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
