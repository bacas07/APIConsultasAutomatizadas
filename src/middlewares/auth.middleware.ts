import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import ApiError from '../errors/error.js'
import UserService from '../models/user.model.js'
import { IUserMongoose, UserRole } from '../types/types.js'

declare global {
  namespace Express {
    interface Request {
      user?: IUserMongoose
      userId?: string
      userRole?: UserRole
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('ERROR CRÍTICO: JWT_SECRET no definido en las variables de entorno.')
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(
      new ApiError(
        'Acceso denegado. No se proporcionó token de autenticación.',
        401
      )
    )
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET as string)
    const currentUser = await UserService.getUserById(decoded.id)

    if (!currentUser) {
      return next(
        new ApiError('El usuario asociado al token ya no existe.', 401)
      )
    }

    req.user = currentUser
    req.userId = currentUser._id!.toString()
    req.userRole = currentUser.role

    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Token de autenticación inválido.', 401))
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Token de autenticación expirado.', 401))
    }
    next(new ApiError(`Error de autenticación: ${error.message}`, 500))
  }
}
