class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
