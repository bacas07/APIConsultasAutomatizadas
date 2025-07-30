import parser from 'cron-parser';

class TimeSchedulerUtil {
  public getNextExecutionTime(
    cronExpression: string,
    lastExecutionTime?: Date
  ): Date {
    try {
      const options = {
        currentDate: lastExecutionTime || new Date(),
        iterator: false,
        tz: 'America/Bogota',
      };

      const interval = parser.parse(cronExpression, options);

      const next = interval.next();
      return next.toDate();
    } catch (error: any) {
      console.error(
        `Error al parsear la expresión cron "${cronExpression}":`,
        error.message
      );
      throw new Error(
        `Expresión cron inválida: ${cronExpression}. Detalle: ${error.message}`
      );
    }
  }
}

export default new TimeSchedulerUtil();
