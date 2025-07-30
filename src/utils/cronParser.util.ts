import cronParser from 'cron-parser';
const { parseExpression } = cronParser;

class TimeSchedulerUtil {
  public getNextExecutionTime(
    cronExpression: string,
    lastExecutionTime?: Date
  ): Date {
    try {
      const options = {
        currentDate: lastExecutionTime || new Date(),
        iterator: true,
        tz: 'America/Bogota',
      };

      const interval = parseExpression(cronExpression, options);
      const result = interval.next();

      if ('value' in result && result.value) {
        return result.value.toDate();
      }

      throw new Error(
        'No se encontró una próxima fecha válida en la expresión cron'
      );
    } catch (error: any) {
      console.error(
        `Error al parsear cron "${cronExpression}":`,
        error.message
      );
      throw new Error(
        `Expresión cron inválida: ${cronExpression}. Detalle: ${error.message}`
      );
    }
  }
}

export default new TimeSchedulerUtil();
