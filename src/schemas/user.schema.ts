import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { IUser, IUserMongoose, UserRole } from '../types/types.js';
import bcrypt from 'bcryptjs';

const UserSchema: Schema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es requerido.'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres.'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida.'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Client', 'User'],
      default: 'User',
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUserMongoose>('save', async function (next) {
  if (
    this.isModified('password') &&
    typeof this.password === 'string' &&
    this.password.length > 0
  ) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<IUserMongoose>('User', UserSchema);

export default UserModel;
