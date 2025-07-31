import { Pool as PgPool, PoolClient, QueryResult as PgQueryResult } from 'pg';
import mysql from 'mysql2/promise';
import { DatabaseConnectionMongoose } from '../types/types.js';
import ApiError from '../errors/error.js';

const pgPoolMap = new Map<string, PgPool>();
const mysqlPoolMap = new Map<string, mysql.Pool>();

class ExternalDatabaseConnection {
  public getOrCreateConnectionPool(
    connection: DatabaseConnectionMongoose
  ): PgPool | mysql.Pool {
    const connectionString = connection.connectionString;

    switch (connection.type) {
      case 'postgresql':
        if (!pgPoolMap.has(connectionString)) {
          const newPool = new PgPool({ connectionString });
          pgPoolMap.set(connectionString, newPool);
          console.log(
            `Pool de conexión PostgreSQL creado para: ${connection.name}`
          );
        }
        return pgPoolMap.get(connectionString)!;
      case 'mysql':
        if (!mysqlPoolMap.has(connectionString)) {
          const newPool = mysql.createPool(connectionString);
          mysqlPoolMap.set(connectionString, newPool);
          console.log(`Pool de conexión MySQL creado para: ${connection.name}`);
        }
        return mysqlPoolMap.get(connectionString)!;
      default:
        throw new ApiError(
          `Tipo de base de datos no soportado: ${connection.type}`,
          400
        );
    }
  }

  public async executeQuery(
    connection: DatabaseConnectionMongoose,
    sql: string,
    values: any[]
  ): Promise<any[]> {
    let client: PoolClient | mysql.PoolConnection | undefined;
    try {
      const pool = this.getOrCreateConnectionPool(connection);

      switch (connection.type) {
        case 'postgresql':
          client = await (pool as PgPool).connect();
          const pgResult: PgQueryResult = await (client as PoolClient).query(
            sql,
            values
          );
          return pgResult.rows;
        case 'mysql':
          client = await (pool as mysql.Pool).getConnection();
          const [rows] = await (client as mysql.PoolConnection).execute(
            sql,
            values
          );
          return rows as any[];
        default:
          throw new ApiError(
            `Tipo de base de datos no soportado para ejecución: ${connection.type}.`,
            400
          );
      }
    } catch (error: any) {
      console.error(
        `Error al ejecutar consulta en ${connection.type} para ${connection.name}: ${error.message}`,
        error.stack
      );
      throw new ApiError(
        `Error de conexión o ejecución en ${connection.type}: ${error.message}`,
        500
      );
    } finally {
      if (client) {
        if (connection.type === 'postgresql') {
          (client as PoolClient).release();
        } else if (connection.type === 'mysql') {
          (client as mysql.PoolConnection).release();
        }
      }
    }
  }
  public async closeAllPools(): Promise<void> {
    console.log(
      'Cerrando todos los pools de conexión de bases de datos externas...'
    );
    for (const pool of pgPoolMap.values()) {
      await pool.end();
    }
    pgPoolMap.clear();

    for (const pool of mysqlPoolMap.values()) {
      await pool.end();
    }
    mysqlPoolMap.clear();
    console.log('Pools de conexión cerrados.');
  }
}

export default new ExternalDatabaseConnection();
