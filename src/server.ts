import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Importaciones de base de datos
import { connectDB } from './database/mongo.database.js';

// Importaciones del Scheduler
import mainSchedulerService from './services/mainScheduler.service.js';

// Importaciones de rutas API
import DatabaseConnectionRouter from './routes/databaseConnection.routes.js';
import QueryTemplateRouter from './routes/queryTemplate.routes.js';
import ScheduledQueryRouter from './routes/scheduledQuery.routes.js';
import QueryResultHistoryRouter from './routes/queryResultHistory.routes.js';

import AuthRouter from './routes/auth.routes.js';
import UserRouter from './routes/user.routes.js';
import ReportHistoryRouter from './routes/reportHistory.routes.js';

// Importación del manejador de errores global
import { errorHandler } from './middlewares/custom/errorHandler.js';

const PORT = process.env.PORT || 5000;
const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(cors());

// Rutas API versionadas
server.use('/api/connections', DatabaseConnectionRouter);
server.use('/api/query-templates', QueryTemplateRouter);
server.use('/api/scheduled-queries', ScheduledQueryRouter);
server.use('/api/query-history', QueryResultHistoryRouter);

// Nuevas Rutas agregadas
server.use('/api/auth', AuthRouter);
server.use('/api/users', UserRouter);
server.use('/api/report-history', ReportHistoryRouter);

// Ruta de bienvenida o salud
server.get('/', (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: 'Bienvenido a la API de Programación de Consultas' });
});

// Middleware de manejo de errores (siempre al final, después de todas las rutas)
server.use(errorHandler);

const startingServer = async () => {
  try {
    await connectDB();
    await mainSchedulerService.start();

    server.listen(PORT, () => {
      console.log(`> Servidor corriendo en el puerto: ${PORT}`);
    });
  } catch (error) {
    console.error('> Error al iniciar el servidor:', (error as Error).message);
    process.exit(1);
  }
};

startingServer();
