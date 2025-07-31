// src/services/onDemandQuery.service.ts
import { Types } from 'mongoose';
import ExternalDatabaseConnection from '../database/externalDatabaseConnection.js';
// import QueryTemplateService from '../models/queryTemplate.model.js'; // <<<<< Ya NO es necesario aquí
import {
  QueryTemplateMongoose, // Sigue siendo necesario para tipar el parámetro
  DatabaseConnectionMongoose,
} from '../types/types.js';
import ApiError from '../errors/error.js';

class OnDemandQueryService {
  public async executeQuery(
    // CAMBIO IMPORTANTE: Ahora espera la plantilla completa
    queryTemplate: QueryTemplateMongoose, 
    parametersValues: Array<{ name: string; value: any }>
  ): Promise<any[]> {
    const MAX_RETRIES = 3;
    let currentRetry = 0;

    // Ya no necesitamos buscar la plantilla, ya viene en el parámetro
    // const queryTemplate = await (
    //   QueryTemplateService as any
    // ).getQueryTemplateById(queryTemplateId.toString());
    if (!queryTemplate) { // Esta validación es menos probable ahora, pero sigue siendo buena
      throw new ApiError(
        `Plantilla de consulta no proporcionada para ejecución.`,
        400
      );
    }

    const dbConnection =
      queryTemplate.databaseConnectionId as DatabaseConnectionMongoose;
    if (!dbConnection || !dbConnection.connectionString) {
      throw new ApiError(
        `Configuración de conexión inválida para plantilla "${queryTemplate.name}".`,
        400
      );
    }

    while (currentRetry < MAX_RETRIES) {
      try {
        // Aseguramos el acceso a querySql directamente desde el objeto queryTemplate
        let sql = queryTemplate.querySql; 
        const values: any[] = [];
        let paramIndex = 1;

        const providedParamsMap = new Map<string, any>(
          parametersValues.map((p) => [p.name, p.value])
        );

        const regex = /\$\{(\w+)\}/g;
        sql = sql.replace(regex, (match: string, paramName: string) => {
          if (providedParamsMap.has(paramName)) {
            values.push(providedParamsMap.get(paramName));
          } else {
            const templateParam = queryTemplate.parameters.find( // Acceso directo a parameters
              (p) => p.name === paramName
            );
            if (templateParam && templateParam.defaultValue !== undefined) {
              values.push(templateParam.defaultValue);
            } else {
              console.warn(`Parámetro '${paramName}' sin valor. Usando null.`);
              values.push(null);
            }
          }
          return dbConnection.type === 'postgresql' ? `$${paramIndex++}` : '?';
        });

        console.log(`[OnDemandQuery] SQL: ${sql}`);
        console.log(`[OnDemandQuery] Valores: ${JSON.stringify(values)}`);

        const results = await ExternalDatabaseConnection.executeQuery(
          dbConnection,
          sql,
          values
        );
        return results;
      } catch (error: any) {
        currentRetry++;
        console.warn(
          `[OnDemandQuery] Intento ${currentRetry}/${MAX_RETRIES} fallido: ${error.message}`
        );
        if (currentRetry < MAX_RETRIES) {
          const delay = Math.pow(2, currentRetry) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`[OnDemandQuery] Reintentos agotados.`);
          if (error instanceof ApiError) throw error;
          throw new ApiError(
            `Error ejecutando plantilla "${queryTemplate.name}" después de ${MAX_RETRIES} intentos: ${error.message}`,
            500
          );
        }
      }
    }

    throw new ApiError('Error inesperado en OnDemandQueryService.', 500);
  }
}

export default new OnDemandQueryService();