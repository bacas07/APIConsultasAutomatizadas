import { Client as PgClient } from 'pg';
import ApiError from '../errors/error.js';

export const connectExternalDB = async (
  dbType: string,
  connectionString: string
): Promise<PgClient> => {
  if (dbType === 'postgresql') {
    const client = new PgClient({ connectionString });
    try {
      await client.connect();
      return client;
    } catch (error: any) {
      throw new ApiError(
        `Error al conectar a PostgreSQL: ${error.message}`,
        500
      );
    }
  } else {
    throw new ApiError(
      `Tipo de base de datos externa no soportado: ${dbType}`,
      400
    );
  }
};
