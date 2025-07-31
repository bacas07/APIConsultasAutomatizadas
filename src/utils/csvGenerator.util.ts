import { Parser } from '@json2csv/plainjs';
import ApiError from '../errors/error.js';

class CsvGenerator {
  public async generateCsv(data: object[]): Promise<string> {
    if (!data || data.length === 0) {
      throw new ApiError('No hay datos para generar el CSV.', 400);
    }

    try {
      const parser = new Parser();
      const csv = parser.parse(data);
      return csv;
    } catch (error: any) {
      console.error('Error al generar CSV:', error);
      throw new ApiError(
        `Error al generar el archivo CSV: ${error.message}`,
        500
      );
    }
  }
}

export default new CsvGenerator();
