import * as cron from 'node-cron';
import { ScheduledQueryModel } from '../schemas/scheduledQuery.schema.js';
import timeSchedulerUtil from '../utils/cronParser.util.js';
import ReportOrchestatorService from './reportOrchestator.service.js';
import { ScheduledQueryMongoose } from '../types/types.js';

class MainScheduler {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

  public async start(): Promise<void> {
    console.log('Iniciando el Scheduler principal...');
    await this.loadAndScheduleAllQueries();

    cron.schedule(
      '0 * * * *',
      async () => {
        console.log('Recargando consultas programadas...');
        await this.loadAndScheduleAllQueries();
      },
      {
        timezone: 'America/Bogota',
      }
    );
  }

  private async loadAndScheduleAllQueries(): Promise<void> {
    try {
      this.stopAllScheduledTasks();

      const activeQueries = await ScheduledQueryModel.find({ isActive: true })
        .populate({
          path: 'queryTemplateId',
          model: 'QueryTemplate',
          populate: {
            path: 'databaseConnectionId',
            model: 'DatabaseConnection',
          },
        })
        .exec();

      if (activeQueries.length === 0) {
        console.log(
          'No se encontraron consultas programadas activas para cargar.'
        );
        return;
      }

      console.log(`Cargando ${activeQueries.length} consultas programadas...`);
      for (const query of activeQueries as ScheduledQueryMongoose[]) {
        this.scheduleSingleQuery(query);
      }
      console.log('Consultas programadas cargadas y activas.');
    } catch (error: any) {
      console.error(
        'Error al cargar y programar consultas:',
        error.message,
        error.stack
      );
    }
  }

  private scheduleSingleQuery(scheduledQuery: ScheduledQueryMongoose): void {
    if (!scheduledQuery.cronExpression) {
      console.warn(
        `Consulta programada sin expresión cron, ID: ${scheduledQuery._id.toString()}`
      );
      return;
    }

    try {
      timeSchedulerUtil.getNextExecutionTime(scheduledQuery.cronExpression);

      const task = cron.schedule(
        scheduledQuery.cronExpression,
        async () => {
          console.log(
            `Ejecutando tarea para consulta programada ID: ${scheduledQuery._id.toString()}`
          );
          let executionSuccess = false;
          try {
            const reportRecord =
              await ReportOrchestatorService.generateAndSendScheduledReport(
                scheduledQuery
              );
            console.log(
              `Consulta ID ${scheduledQuery._id.toString()} ejecutada exitosamente. Reporte ID: ${reportRecord._id}`
            );
            executionSuccess = true;
          } catch (executionError: any) {
            console.error(
              `Error al ejecutar consulta programada ID: ${scheduledQuery._id.toString()}:`,
              executionError.message
            );
            executionSuccess = false;
          } finally {
            const now = new Date();
            const nextExecution = timeSchedulerUtil.getNextExecutionTime(
              scheduledQuery.cronExpression,
              now
            );
            await ScheduledQueryModel.findByIdAndUpdate(scheduledQuery._id, {
              lastExecutionTime: now,
              nextExecutionTime: nextExecution,
            });
            console.log(
              `Tiempos de ejecución actualizados para consulta ID: ${scheduledQuery._id.toString()}`
            );
          }
        },
        {
          timezone: 'America/Bogota',
        }
      );

      this.scheduledTasks.set(scheduledQuery._id.toString(), task);
      console.log(
        `Consulta ID: ${scheduledQuery._id.toString()} programada para '${scheduledQuery.cronExpression}'`
      );
    } catch (error: any) {
      console.error(
        `No se pudo programar la consulta ID: ${scheduledQuery._id.toString()} debido a una expresión cron inválida o error: ${error.message}`
      );
    }
  }

  private stopAllScheduledTasks(): void {
    this.scheduledTasks.forEach((task) => task.stop());
    this.scheduledTasks.clear();
    console.log('Todas las tareas programadas detenidas y eliminadas.');
  }
}

export default new MainScheduler();
