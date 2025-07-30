import {
  QueryTemplateMongoose,
  ScheduledQueryMongoose,
  QueryResultHistoryMongoose,
  DatabaseConnectionMongoose,
} from '../types/types.js';
import QueryResultHistoryService from '../models/queryResultHistory.model.js';
import ApiError from '../errors/error.js';
import { Types } from 'mongoose';
import { connectExternalDB } from '../database/postgresql.database.js';

class QueryExecutionService {
  public async executeScheduledQuery(
    scheduledQuery: ScheduledQueryMongoose
  ): Promise<any[]> {
    let client: any | null = null;
    let queryResult: any[] = [];
    let status: 'success' | 'failed' = 'failed';
    let errorMessage: string | undefined;

    const scheduledQueryId: Types.ObjectId =
      scheduledQuery._id as Types.ObjectId;
    const { parametersValues } = scheduledQuery;

    const isQueryTemplatePopulated = (
      qt: Types.ObjectId | QueryTemplateMongoose
    ): qt is QueryTemplateMongoose => {
      return (
        qt instanceof Types.ObjectId === false &&
        (qt as QueryTemplateMongoose).name !== undefined
      );
    };

    if (
      !scheduledQuery.queryTemplateId ||
      !isQueryTemplatePopulated(scheduledQuery.queryTemplateId)
    ) {
      errorMessage =
        'La plantilla de consulta no fue populada correctamente o el ID es inválido.';
      console.error(errorMessage, scheduledQueryId.toString());
      await QueryResultHistoryService.createOne({
        scheduledQueryId: scheduledQueryId,
        executionTime: new Date(),
        status: 'failed',
        result: {},
        errorMessage: errorMessage,
        executedQuerySql: 'N/A: Query template not populated',
      });
      throw new Error(errorMessage);
    }

    const queryTemplate: QueryTemplateMongoose = scheduledQuery.queryTemplateId;

    const isDatabaseConnectionPopulated = (
      db: Types.ObjectId | DatabaseConnectionMongoose
    ): db is DatabaseConnectionMongoose => {
      return (
        db instanceof Types.ObjectId === false &&
        (db as DatabaseConnectionMongoose).connectionString !== undefined
      );
    };

    if (
      !queryTemplate.databaseConnectionId ||
      !isDatabaseConnectionPopulated(queryTemplate.databaseConnectionId)
    ) {
      errorMessage = `Configuración de conexión a base de datos inválida para plantilla "${queryTemplate.name}". No populada o inválida.`;
      console.error(errorMessage, queryTemplate.databaseConnectionId);
      await QueryResultHistoryService.createOne({
        scheduledQueryId: scheduledQueryId,
        executionTime: new Date(),
        status: 'failed',
        result: {},
        errorMessage: errorMessage,
        executedQuerySql: queryTemplate.querySql,
      });
      throw new Error(errorMessage);
    }

    const dbConnection: DatabaseConnectionMongoose =
      queryTemplate.databaseConnectionId;

    try {
      client = await connectExternalDB(
        dbConnection.type,
        dbConnection.connectionString
      );

      const sqlParams = parametersValues.map((p) => p.value);

      if (dbConnection.type === 'postgresql') {
        const pgClient = client;
        const result = await pgClient.query(queryTemplate.querySql, sqlParams);
        queryResult = result.rows;
      } else {
        throw new Error(
          `Tipo de base de datos no soportado para ejecución: ${dbConnection.type}`
        );
      }

      status = 'success';
      return queryResult;
    } catch (error: any) {
      status = 'failed';
      errorMessage = `Error al ejecutar consulta SQL para "${queryTemplate.name}": ${error.message}`;
      console.error(errorMessage, error.stack);
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new Error(errorMessage);
      }
    } finally {
      if (client && typeof client.end === 'function') {
        await client
          .end()
          .catch((e: any) =>
            console.error('Error al cerrar conexión de DB externa:', e)
          );
      }
      await QueryResultHistoryService.createOne({
        scheduledQueryId: scheduledQueryId,
        executionTime: new Date(),
        status: status,
        result: queryResult,
        errorMessage: errorMessage,
        executedQuerySql: queryTemplate.querySql,
      });
    }
  }
}

export default new QueryExecutionService();
