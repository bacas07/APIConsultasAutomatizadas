import { Types } from 'mongoose';
import OnDemandQueryService from './onDemandQuery.service.js';
import CsvGenerator from '../utils/csvGenerator.util.js';
import EmailService from './email.service.js';
import ReportHistoryService from '../models/reportHistory.model.js';
import QueryResultHistoryService from '../models/queryResultHistory.model.js';
import {
  ScheduledQueryMongoose,
  ReportConfig,
  IReportHistory,
  QueryResultHistoryMongoose,
  QueryTemplateMongoose,
} from '../types/types.js';
import ApiError from '../errors/error.js';

class ReportOrchestratorService {
  public async generateAndSendScheduledReport(
    scheduledQuery: ScheduledQueryMongoose
  ): Promise<IReportHistory> {
    if (!scheduledQuery.reportConfig) {
      throw new ApiError(
        `La consulta programada "${scheduledQuery.name}" no tiene configuración de reporte.`,
        400
      );
    }

    const queryTemplate =
      scheduledQuery.queryTemplateId as QueryTemplateMongoose;
    if (!queryTemplate || !queryTemplate._id) {
      throw new ApiError(
        `Plantilla inválida o no populada en ScheduledQuery ID: ${scheduledQuery._id}`,
        400
      );
    }

    const reportConfig: ReportConfig = scheduledQuery.reportConfig;
    const formattedDate = new Date().toISOString().split('T')[0];

    const fileName = this.replaceTemplatePlaceholders(
      reportConfig.fileNameTemplate || 'report_{{name}}_{{date}}.csv',
      scheduledQuery,
      formattedDate
    );
    const subject = this.replaceTemplatePlaceholders(
      reportConfig.emailSubjectTemplate || 'Reporte de {{name}} - {{date}}',
      scheduledQuery,
      formattedDate
    );
    const body = this.replaceTemplatePlaceholders(
      reportConfig.emailBodyTemplate ||
        '<p>Adjunto encontrarás el reporte de <b>{{name}}</b>.</p>',
      scheduledQuery,
      formattedDate
    );

    const reportData: Partial<IReportHistory> = {
      scheduledQueryId: scheduledQuery._id,
      queryTemplateId: queryTemplate._id,
      generatedAt: new Date(),
      fileName,
      recipients: reportConfig.emailRecipients,
      emailStatus: 'failed',
      status: 'failed',
    };

    let queryResultRecord: QueryResultHistoryMongoose | null = null;
    let finalError: any = null;

    try {
      const queryResults = await OnDemandQueryService.executeQuery(
        queryTemplate,
        scheduledQuery.parametersValues
      );

      queryResultRecord = await QueryResultHistoryService.createOne({
        scheduledQueryId: scheduledQuery._id,
        executionTime: new Date(),
        status: 'success',
        result: queryResults.length ? queryResults : 'No data',
        errorMessage: undefined,
        executedQuerySql: queryTemplate.querySql,
      });
      // @ts-ignore
      reportData.associatedQueryResultId = queryResultRecord._id;

      const csvContent = await CsvGenerator.generateCsv(queryResults);
      reportData.fileSizeKB = Buffer.byteLength(csvContent, 'utf8') / 1024;

      await EmailService.sendEmail(
        reportConfig.emailRecipients,
        subject,
        body,
        [{ filename: fileName, content: csvContent, contentType: 'text/csv' }]
      );
      reportData.emailStatus = 'sent';
      reportData.status = 'success';
    } catch (error: any) {
      finalError = error;
      reportData.status = 'failed';
      reportData.errorMessage = error.message;
      reportData.emailStatus = 'failed';

      if (!queryResultRecord) {
        await QueryResultHistoryService.createOne({
          scheduledQueryId: scheduledQuery._id,
          executionTime: new Date(),
          status: 'failed',
          result: 'Error en ejecución o generación',
          errorMessage: error.message,
          executedQuerySql: queryTemplate.querySql,
        });
      }
    } finally {
      const createdRecord = await ReportHistoryService.createReportRecord(
        reportData as IReportHistory
      );
      // @ts-ignore
      console.log(
        `[ReportOrchestrator] Historial guardado: ${createdRecord._id}`
      );
      if (finalError) throw finalError;
      return createdRecord;
    }
  }

  private replaceTemplatePlaceholders(
    template: string,
    scheduledQuery: ScheduledQueryMongoose,
    formattedDate: string
  ): string {
    let result = template;
    result = result.replace(
      /\{\{name\}\}/g,
      scheduledQuery.name || 'Sin Nombre'
    );
    result = result.replace(/\{\{date\}\}/g, formattedDate);
    return result;
  }
}

export default new ReportOrchestratorService();
