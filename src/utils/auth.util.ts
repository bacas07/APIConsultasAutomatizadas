import UserService from '../models/user.model.js';
import { IUser, IUserMongoose, UserRole } from '../types/types.js';
import ApiError from '../errors/error.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new ApiError('JWT_SECRET no definida', 500);
}
const JWT_EXPIRES_IN = '1h';

class AuthService {
  public async register(
    userData: IUser
  ): Promise<{ user: IUser; token: string }> {
    if (!userData.username || !userData.password) {
      throw new ApiError('Nombre de usuario y contraseña son requeridos.', 400);
    }
    if (userData.role && !['Admin', 'Client', 'User'].includes(userData.role)) {
      throw new ApiError('Rol de usuario inválido.', 400);
    }
    try {
      const newUser = await UserService.createUser(userData);
      const token = this.generateToken(newUser._id!.toString(), newUser.role);
      return { user: newUser.toObject(), token };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error en el registro: ${error.message}`, 500);
    }
  }

  public async login(
    username: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    if (!username || !password) {
      throw new ApiError('Nombre de usuario y contraseña son requeridos.', 400);
    }
    try {
      const user = await UserService.findUserByUsername(username, true);
      if (!user || !(await (user as any).comparePassword(password))) {
        throw new ApiError('Credenciales inválidas.', 401);
      }
      const token = this.generateToken(user._id!.toString(), user.role);
      const { password: pw, ...userObj } = user.toObject();
      return { user: userObj as IUser, token };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error en el login: ${error.message}`, 500);
    }
  }

  private generateToken(userId: string, role: UserRole): string {
    return jwt.sign({ id: userId, role }, JWT_SECRET as string, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }
}

export default new AuthService();
