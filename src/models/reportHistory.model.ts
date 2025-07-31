import ReportHistoryModel from '../schemas/reportHistory.schema.js';
import { IReportHistory, ReportHistoryMongoose } from '../types/types.js';
import ApiError from '../errors/error.js';
import mongoose from 'mongoose';

class ReportHistoryService {
  public async createReportRecord(
    reportData: IReportHistory
  ): Promise<ReportHistoryMongoose> {
    try {
      const newRecord = new ReportHistoryModel(reportData);
      await newRecord.save();
      return newRecord.toObject() as ReportHistoryMongoose;
    } catch (error: any) {
      throw new ApiError(
        `Error al crear el registro de historial de reporte: ${error.message}`,
        500
      );
    }
  }

  public async getReportRecordById(
    id: string
  ): Promise<ReportHistoryMongoose | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('ID de registro de reporte inválido.', 400);
    }
    try {
      return ReportHistoryModel.findById(id).exec();
    } catch (error: any) {
      throw new ApiError(
        `Error al obtener registro de reporte por ID: ${error.message}`,
        500
      );
    }
  }

  public async getAllReportRecords(): Promise<ReportHistoryMongoose[]> {
    try {
      return ReportHistoryModel.find().exec();
    } catch (error: any) {
      throw new ApiError(
        `Error al obtener todos los registros de reportes: ${error.message}`,
        500
      );
    }
  }

  public async getReportRecordsByScheduledQuery(
    scheduledQueryId: string
  ): Promise<ReportHistoryMongoose[]> {
    if (!mongoose.Types.ObjectId.isValid(scheduledQueryId)) {
      throw new ApiError('ID de consulta programada inválido.', 400);
    }
    try {
      return ReportHistoryModel.find({ scheduledQueryId }).exec();
    } catch (error: any) {
      throw new ApiError(
        `Error al obtener registros por ID de consulta programada: ${error.message}`,
        500
      );
    }
  }
}

export default new ReportHistoryService();
