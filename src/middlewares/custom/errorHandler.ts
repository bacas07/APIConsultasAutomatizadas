import type { ErrorRequestHandler } from 'express';
import ApiError from '../../errors/error.js';

export const errorHandler: ErrorRequestHandler = (error, _, res, next) => {
  console.error(error);

  let statusCode = 500;
  let message =
    'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.';

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (
    error &&
    typeof error === 'object' &&
    (error as any).issues &&
    Array.isArray((error as any).issues)
  ) {
    statusCode = 400;
    message = 'Error de validación de entrada.';
  } else if (
    error &&
    typeof error === 'object' &&
    (error as any).name === 'ValidationError'
  ) {
    statusCode = 400;
    message = 'Error en la validación o duplicado de la base de datos.';
  }
  res.status(statusCode).json({
    message: message,
  });
};
