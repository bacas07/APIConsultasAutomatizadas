// src/services/reportOrchestrator.service.ts

import { Types } from 'mongoose';
import OnDemandQueryService from './onDemandQuery.service.js';
import CsvGenerator from '../utils/csvGenerator.util.js';
import EmailService from './email.service.js';
import ReportHistoryService from '../models/reportHistory.model.js';
import QueryResultHistoryService from '../models/queryResultHistory.model.js';
import ApiError from '../errors/error.js';

class ReportOrchestratorService {
  public async generateAndSendScheduledReport(
    scheduledQuery: any
  ): Promise<any> {
    if (!scheduledQuery.reportConfig) {
      throw new ApiError(
        `La consulta programada no tiene configuración de reporte.`,
        400
      );
    }

    const reportConfig: any = scheduledQuery.reportConfig;
    const reportData: any = {
      scheduledQueryId: scheduledQuery._id,
      queryTemplateId: (scheduledQuery.queryTemplateId as any)?._id,
      generatedAt: new Date(),
      fileName: '',
      recipients: reportConfig.emailRecipients,
      emailStatus: 'failed',
      status: 'failed',
    };

    let queryResults: any[] = [];
    let csvContent = '';
    let queryResultRecord: any = null;
    let finalError: any = null;

    try {
      queryResults = await OnDemandQueryService.executeQuery(
        (scheduledQuery.queryTemplateId as any)._id,
        scheduledQuery.parametersValues as any
      );

      queryResultRecord = await (
        QueryResultHistoryService as any
      ).createQueryResult({
        scheduledQueryId: scheduledQuery._id,
        executionTime: new Date(),
        status: 'success',
        result: queryResults.length > 0 ? queryResults : 'No data',
        executedQuerySql: (scheduledQuery.queryTemplateId as any).querySql,
      });

      reportData.associatedQueryResultId = queryResultRecord._id;

      csvContent = await CsvGenerator.generateCsv(queryResults);
      reportData.fileSizeKB = Buffer.byteLength(csvContent, 'utf8') / 1024;

      const formattedDate = new Date().toISOString().split('T')[0];
      const fileName = reportConfig.fileNameTemplate
        ? reportConfig.fileNameTemplate
            .replace('{{date}}', formattedDate)
            .replace('{{name}}', (scheduledQuery.name as any) ?? '')
        : `report_${(scheduledQuery.name as any) ?? ''}_${formattedDate}.csv`;
      const subject = reportConfig.emailSubjectTemplate
        ? reportConfig.emailSubjectTemplate
            .replace('{{date}}', formattedDate)
            .replace('{{name}}', (scheduledQuery.name as any) ?? '')
        : `Reporte - ${(scheduledQuery.name as any) ?? ''} - ${formattedDate}`;
      const body = reportConfig.emailBodyTemplate
        ? reportConfig.emailBodyTemplate
            .replace('{{date}}', formattedDate)
            .replace('{{name}}', (scheduledQuery.name as any) ?? '')
        : `<p>Adjunto reporte.</p>`;
      reportData.fileName = fileName;

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

      if (!queryResultRecord) {
        await (QueryResultHistoryService as any).createQueryResult({
          scheduledQueryId: scheduledQuery._id,
          executionTime: new Date(),
          status: 'failed',
          result: 'Error during execution',
          errorMessage: error.message,
          executedQuerySql: (scheduledQuery.queryTemplateId as any).querySql,
        });
      }
    } finally {
      const createdRecord = await (
        ReportHistoryService as any
      ).createReportRecord(reportData);
      if (finalError) throw finalError;
      return createdRecord;
    }
  }

  public async generateAndSendOnDemandReport(
    queryTemplateId: string,
    parametersValues: Array<{ name: string; value: any }>,
    recipients: string[],
    options?: { subject?: string; body?: string; fileName?: string }
  ): Promise<any> {
    throw new ApiError('Funcionalidad no implementada.', 501);
  }

  private replaceTemplatePlaceholders(
    template: string,
    scheduledQuery: any,
    formattedDate: string
  ): string {
    return template
      .replace('{{name}}', (scheduledQuery.name as any) ?? 'Sin Nombre')
      .replace('{{date}}', formattedDate);
  }
}

export default new ReportOrchestratorService();
