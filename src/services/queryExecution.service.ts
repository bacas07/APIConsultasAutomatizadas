import { Pool, QueryResult } from 'pg';
import ApiError from '../errors/error.js';
import {
  ScheduledQueryMongoose,
  QueryTemplateMongoose,
  DatabaseConnectionMongoose,
} from '../types/types.js';

const poolMap = new Map<string, Pool>();

function getOrCreateConnectionPool(
  connection: DatabaseConnectionMongoose
): Pool {
  const connectionString = connection.connectionString;
  if (!poolMap.has(connectionString)) {
    const newPool = new Pool({ connectionString });
    poolMap.set(connectionString, newPool);
    console.log(`Pool de conexión creado para: ${connection.name}`);
  }
  return poolMap.get(connectionString)!;
}

export async function executeScheduledQuery(
  scheduledQuery: ScheduledQueryMongoose
): Promise<any> {
  const queryTemplate = scheduledQuery.queryTemplateId as QueryTemplateMongoose;

  if (!queryTemplate || !queryTemplate.databaseConnectionId) {
    throw new ApiError(
      `Configuración de conexión a base de datos inválida para plantilla "${queryTemplate?.name || 'desconocida'}". No populada o inválida.`,
      400
    );
  }

  const dbConnection =
    queryTemplate.databaseConnectionId as DatabaseConnectionMongoose;

  const pool = getOrCreateConnectionPool(dbConnection);

  let client;
  try {
    client = await pool.connect();

    let sql = queryTemplate.querySql;
    const values: any[] = [];
    let paramIndex = 1;

    const regex = /\$\{(\w+)\}/g;
    const providedParamsMap = new Map(
      scheduledQuery.parametersValues.map((p) => [p.name, p.value])
    );

    sql = sql.replace(regex, (match, paramName) => {
      if (providedParamsMap.has(paramName)) {
        values.push(providedParamsMap.get(paramName));
        return `$${paramIndex++}`;
      } else {
        console.warn(
          `Parámetro '${paramName}' en la consulta SQL no tiene un valor proporcionado en la consulta programada. Usando null.`
        );
        values.push(null);
        return `$${paramIndex++}`;
      }
    });

    console.log(`Ejecutando SQL: ${sql}`);
    console.log(`Con valores: ${JSON.stringify(values)}`);

    const result: QueryResult = await client.query(sql, values);
    return result.rows;
  } catch (error: any) {
    console.error(
      `Error al ejecutar consulta SQL para "${queryTemplate.name}":`,
      error.message
    );
    throw new ApiError(
      `Error al ejecutar consulta SQL para "${queryTemplate.name}": ${error.message}`,
      500
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
