import mongoose from 'mongoose';
import { config } from 'dotenv';
import ApiError from '../errors/error.js';

config();

const URL = process.env.MONGO_URL;

if (!URL || URL === undefined) {
  throw new ApiError(
    'Error configurando variables de entornos para mongo',
    500
  );
}

export const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log('> Servidor conectado a la base de datos');
  } catch (error) {
    throw new ApiError('Error Conectando servidor a base de datos', 500);
  }
};
