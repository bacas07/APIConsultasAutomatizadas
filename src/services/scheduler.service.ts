// src/services/scheduler.service.ts
import cron from 'node-cron';
import parseExpression from 'cron-parser'; // Para calcular la próxima ejecución
import ScheduledQueryLogicService from '../'
import QueryResultHistoryModel from '../models/queryResultHistory.model.js';
import DatabaseConnectionModel from '../models/databaseConnection.model.js'; // Si usas el modelo de conexiones
import { executeExternalQuery } from '../utils/externalDbExecutor.js';
import type {
  ScheduledQueryMongoose,
  QueryTemplateMongoose,
  QueryResultHistoryMongoose,
  ExternalDbConfig,
} from '../types/index.js';
import ApiError from '../errors/error.js';

// Función para iniciar el scheduler principal
export const startScheduler = () => {
  // Programa una tarea para ejecutarse cada minuto.
  // Ajusta la frecuencia según la granularidad mínima que necesites para tus consultas.
  cron.schedule('* * * * *', async () => {
    console.log(
      `[Scheduler] Verificando consultas pendientes a las ${new Date().toISOString()}`
    );
    try {
      const queriesToExecute: ScheduledQueryMongoose[] =
        await ScheduledQueryModel.findActiveAndDue();

      for (const scheduledQuery of queriesToExecute) {
        // Ejecuta cada consulta en paralelo para no bloquear el scheduler
        executeSingleScheduledQuery(scheduledQuery._id.toString()).catch(
          (error) => {
            console.error(
              `[Scheduler] Error al procesar consulta programada ${scheduledQuery._id}:`,
              error
            );
            // Aquí podrías loguear el error en un sistema de monitoreo
          }
        );
      }
    } catch (error: any) {
      console.error(
        `[Scheduler] Error global en el proceso del scheduler:`,
        error.message
      );
    }
  });
};

// Función para ejecutar una sola consulta programada (útil para el scheduler y para ejecuciones manuales)
export const executeSingleScheduledQuery = async (
  scheduledQueryId: string
): Promise<QueryResultHistoryMongoose> => {
  let status: 'success' | 'failed' = 'failed';
  let result: any = null;
  let errorMessage: string | undefined = undefined;
  let executedSql: string = '';
  let scheduledQuery: ScheduledQueryMongoose | null = null;
  let newResultHistory: QueryResultHistoryMongoose | null = null;

  try {
    scheduledQuery = await ScheduledQueryModel.getById(scheduledQueryId);

    if (!scheduledQuery) {
      throw new ApiError(
        `Consulta programada con ID ${scheduledQueryId} no encontrada.`,
        404
      );
    }

    const template = scheduledQuery.queryTemplateId as QueryTemplateMongoose; // Asume que populate ya trajo el template
    if (!template) {
      throw new ApiError(
        `Plantilla de consulta no encontrada para la consulta programada ${scheduledQueryId}.`,
        404
      );
    }

    // 1. Obtener la configuración de la DB externa
    let dbConfig: ExternalDbConfig;
    if (template.databaseConnectionId) {
      // Opción A: Si DatabaseConnection es un modelo Mongoose
      const dbConn = await DatabaseConnectionModel.getById(
        template.databaseConnectionId
      );
      if (!dbConn) {
        throw new ApiError(
          `Conexión de base de datos externa con ID ${template.databaseConnectionId} no encontrada.`,
          404
        );
      }
      dbConfig = {
        type: dbConn.type,
        connectionString: dbConn.connectionString,
      };

      // Opción B: Si databaseConnectionId es solo un string que mapea a variables de entorno
      // dbConfig = { type: 'postgresql', connectionString: process.env.EXTERNAL_PG_CONN_STRING! }; // Ejemplo
      // if (template.databaseConnectionId === 'my_pg_db') {
      //     dbConfig = { type: 'postgresql', connectionString: process.env.MY_PG_DB_CONN_STRING! };
      // } else {
      //     throw new ApiError(`ID de conexión de base de datos desconocido: ${template.databaseConnectionId}`, 400);
      // }
    } else {
      throw new ApiError(
        `No se especificó ID de conexión de base de datos para la plantilla ${template.name}.`,
        400
      );
    }

    // 2. Preparar la SQL y los parámetros
    const paramsForExecution = scheduledQuery.parametersValues.map(
      (p) => p.value
    );
    executedSql = template.querySql; // Guarda la SQL original de la plantilla

    // 3. Ejecutar la consulta en la DB externa
    result = await executeExternalQuery(
      dbConfig,
      template.querySql,
      paramsForExecution
    );
    status = 'success';
    console.log(
      `[Scheduler] Consulta "${template.name}" (${scheduledQuery._id}) ejecutada exitosamente.`
    );
  } catch (execError: any) {
    status = 'failed';
    errorMessage =
      execError.message ||
      'Error desconocido durante la ejecución de la consulta.';
    console.error(
      `[Scheduler] Error al ejecutar consulta programada ${scheduledQueryId}:`,
      errorMessage
    );
  } finally {
    // 4. Guardar el resultado histórico
    if (scheduledQuery) {
      newResultHistory = await QueryResultHistoryModel.createOne({
        scheduledQueryId: scheduledQuery._id,
        executionTime: new Date(),
        status: status,
        result: result,
        errorMessage: errorMessage,
        executedQuerySql: executedSql,
      });

      // 5. Actualizar la próxima fecha de ejecución para la consulta programada
      let nextExecution: Date;
      try {
        const now = new Date();
        const interval = parseExpression(scheduledQuery.schedule, {
          currentDate: now,
        });
        nextExecution = interval.next().toDate();
      } catch (cronError: any) {
        console.error(
          `[Scheduler] Expresión cron inválida para consulta programada ${scheduledQuery._id}: ${scheduledQuery.schedule}. Desactivando.`,
          cronError.message
        );
        scheduledQuery.isActive = false; // Desactivar si la expresión cron es inválida
        nextExecution = new Date(); // Para que no se intente de nuevo inmediatamente
      }

      await ScheduledQueryModel.updateById(scheduledQuery._id.toString(), {
        nextExecutionTime: nextExecution,
        isActive: scheduledQuery.isActive, // Actualiza el estado isActive si cambió
      });
    }
  }
  if (newResultHistory) {
    return newResultHistory;
  } else {
    // Esto debería manejarse como un error si no se pudo guardar el historial
    throw new ApiError(
      'Error interno: No se pudo guardar el historial de resultados.',
      500
    );
  }
};
