import { Request, Response, NextFunction } from 'express';
import UserService from '../models/user.model.js';
import { IUser } from '../types/types.js';
import ApiError from '../errors/error.js';

class UserController {
  public async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        throw new ApiError('Usuario no encontrado.', 404);
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  public async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updatedUser = await UserService.updateUser(
        req.params.id,
        req.body as Partial<IUser>
      );
      if (!updatedUser) {
        throw new ApiError('Usuario no encontrado para actualizar.', 404);
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
