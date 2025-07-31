import { Request, Response, NextFunction } from 'express';
import ApiError from '../errors/error.js';
import { UserRole } from '../types/types.js';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return next(
        new ApiError('Acceso denegado. Usuario no autenticado.', 401)
      );
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(
        new ApiError('Acceso denegado. No tiene los permisos necesarios.', 403)
      );
    }

    next();
  };
};
