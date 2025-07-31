// src/models/user.model.ts

import mongoose, { Schema, Document } from 'mongoose'; // Asegúrate de que Document también esté aquí
import UserModel from '../schemas/user.schema.js';
import { IUserMongoose, IUser, UserRole } from '../types/types.js';
import ApiError from '../errors/error.js';

class UserService {
  public async createUser(userData: IUser): Promise<IUserMongoose> {
    try {
      const newUser = new UserModel(userData);
      await newUser.save();
      return newUser.toObject() as IUserMongoose;
    } catch (error: any) {
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.username
      ) {
        throw new ApiError('El nombre de usuario ya existe.', 409);
      }
      throw new ApiError(`Error al crear el usuario: ${error.message}`, 500);
    }
  }

  public async getUserById(id: string): Promise<IUserMongoose | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('ID de usuario inválido.', 400);
    }
    try {
      return UserModel.findById(id).exec();
    } catch (error: any) {
      throw new ApiError(
        `Error al obtener usuario por ID: ${error.message}`,
        500
      );
    }
  }

  public async getAllUsers(): Promise<IUserMongoose[]> {
    try {
      return UserModel.find().exec();
    } catch (error: any) {
      throw new ApiError(
        `Error al obtener todos los usuarios: ${error.message}`,
        500
      );
    }
  }

  public async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUserMongoose | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('ID de usuario inválido.', 400);
    }

    if (updateData.role) {
      throw new ApiError('El rol de usuario no puede ser modificado.', 400);
    }

    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).exec();

      if (!updatedUser) {
        return null;
      }
      return updatedUser.toObject() as IUserMongoose;
    } catch (error: any) {
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.username
      ) {
        throw new ApiError('El nombre de usuario ya existe.', 409);
      }
      throw new ApiError(
        `Error al actualizar el usuario: ${error.message}`,
        500
      );
    }
  }
}

export default new UserService();
