/*import cron from 'node-cron';
import ScheduledQueryModel from '../models/scheduledQuery.model.js';
import timeSchedulerUtil from '../utils/cronParser.util.js';
import { executeScheduledQuery } from '../services/queryExecution.service.js';
import { ScheduledQueryMongoose } from '../types/types.js';

class MainScheduler {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

  // Método para iniciar el scheduler, normalmente llamado al iniciar la aplicación
  public async start(): Promise<void> {
    console.log('Iniciando el Scheduler principal...');
    await this.loadAndScheduleAllQueries();

    // Opcional: Programa una tarea para recargar las consultas programadas periódicamente
    // Esto es útil si las consultas cambian o se añaden nuevas sin reiniciar la aplicación
    cron.schedule('0 * * * *', async () => { // Cada hora
      console.log('Recargando consultas programadas...');
      await this.loadAndScheduleAllQueries();
    });
  }

  // Carga todas las consultas programadas de la base de datos y las programa
  private async loadAndScheduleAllQueries(): Promise<void> {
    try {
      // Detiene y elimina todas las tareas programadas actualmente para evitar duplicados
      this.stopAllScheduledTasks();

      // Busca todas las consultas programadas activas, populando las plantillas de consulta
      const activeQueries = await ScheduledQueryModel.find({ isActive: true })
        .populate('queryTemplateId')
        .exec();

      if (activeQueries.length === 0) {
        console.log('No se encontraron consultas programadas activas para cargar.');
        return;
      }

      console.log(`Cargando ${activeQueries.length} consultas programadas...`);
      for (const query of activeQueries as ScheduledQueryMongoose[]) { // Aseguramos el tipo
        this.scheduleSingleQuery(query);
      }
      console.log('Consultas programadas cargadas y activas.');
    } catch (error: any) {
      console.error('Error al cargar y programar consultas:', error.message, error.stack);
    }
  }

  // Programa una única consulta
  private scheduleSingleQuery(scheduledQuery: ScheduledQueryMongoose): void {
    if (!scheduledQuery.cronExpression) {
      console.warn(`Consulta programada sin expresión cron, ID: ${scheduledQuery._id}`);
      return;
    }

    try {
      // Usamos timeSchedulerUtil para validar la expresión cron
      // No necesitamos el resultado aquí, solo queremos que lance un error si es inválida
      timeSchedulerUtil.getNextExecutionTime(scheduledQuery.cronExpression);

      // Programa la tarea cron
      const task = cron.schedule(scheduledQuery.cronExpression, async () => {
        console.log(`Ejecutando tarea para consulta programada ID: ${scheduledQuery._id}`);
        try {
          // Ejecuta la consulta y registra el historial
          const results = await executeScheduledQuery(scheduledQuery);
          console.log(`Consulta ID ${scheduledQuery._id} ejecutada exitosamente. Resultados:`, results);

          // Actualiza la última ejecución y calcula la próxima
          const now = new Date();
          await ScheduledQueryModel.findByIdAndUpdate(scheduledQuery._id, {
            lastExecutionTime: now,
            nextExecutionTime: timeSchedulerUtil.getNextExecutionTime(scheduledQuery.cronExpression, now),
          });

        } catch (executionError: any) {
          console.error(`Error al ejecutar consulta programada ID: ${scheduledQuery._id}:`, executionError.message);
          // La función executeScheduledQuery ya registra el error en QueryResultHistory
          // Aquí solo nos aseguramos de no detener el scheduler principal por un error de una sola tarea
        }
      }, {
        scheduled: true, // Inicia la tarea inmediatamente
        timezone: 'America/Bogota' // ¡CRÍTICO! Asegúrate de que coincida con timeSchedulerUtil
      });

      this.scheduledTasks.set(scheduledQuery._id.toString(), task);
      console.log(`Consulta ID: ${scheduledQuery._id} programada para '${scheduledQuery.cronExpression}'`);

    } catch (error: any) {
      console.error(`No se pudo programar la consulta ID: ${scheduledQuery._id} debido a una expresión cron inválida o error: ${error.message}`);
      // Considera marcar la consulta como inactiva o con error si no se pudo programar
    }
  }

  // Detiene y elimina todas las tareas cron programadas
  private stopAllScheduledTasks(): void {
    this.scheduledTasks.forEach(task => task.stop());
    this.scheduledTasks.clear();
    console.log('Todas las tareas programadas detenidas y eliminadas.');
  }
}

export default new MainScheduler();*/