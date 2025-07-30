API de Consultas AutomatizadasEste proyecto es una API RESTful diseñada para automatizar la ejecución de consultas SQL en bases de datos externas (actualmente PostgreSQL, extensible a otras) y gestionar su programación y el historial de resultados. Permite a los usuarios definir conexiones a bases de datos, crear plantillas de consultas SQL parametrizadas, programar la ejecución recurrente de estas plantillas y consultar el historial de resultados.Estructura del ProyectoLa estructura del proyecto sigue una organización modular, separando las responsabilidades en diferentes directorios:APIConsultasAutomatizadas/
├── dist/                          # Salida de la compilación de TypeScript
├── node_modules/                  # Dependencias del proyecto
├── src/
│   ├── controllers/               # Lógica de manejo de peticiones HTTP
│   │   ├── databaseConnection.controller.ts
│   │   ├── queryResultHistory.controller.ts
│   │   ├── queryTemplate.controller.ts
│   │   └── scheduledQuery.controller.ts
│   ├── database/                  # Configuraciones de conexión a bases de datos
│   │   ├── mongo.database.ts      # Conexión a MongoDB
│   │   └── postgresql.database.ts # Conexión a PostgreSQL (externa)
│   ├── errors/                    # Clases de errores personalizados (ApiError)
│   │   └── error.ts
│   ├── middlewares/               # Middlewares de Express
│   │   └── custom/
│   │       └── errorHandler.ts    # Manejador de errores global
│   ├── models/                    # Lógica de negocio y servicios que interactúan con los esquemas
│   │   ├── databaseConnection.model.ts
│   │   ├── queryResultHistory.model.ts
│   │   ├── queryTemplate.model.ts
│   │   └── scheduledQuery.model.ts
│   ├── routes/                    # Definición de rutas de la API
│   │   ├── databaseConnection.routes.ts
│   │   ├── queryResultHistory.routes.ts
│   │   ├── queryTemplate.routes.ts
│   │   └── scheduledQuery.routes.ts
│   ├── schemas/                   # Definiciones de esquemas de Mongoose
│   │   ├── databaseConnection.schema.ts
│   │   ├── queryResultHistory.schema.ts
│   │   ├── queryTemplate.schema.ts
│   │   └── scheduledQuery.schema.ts
│   ├── services/                  # Lógica central de servicios (Scheduler, ejecución de consultas)
│   │   ├── mainScheduler.service.ts
│   │   └── queryExecution.service.ts
│   ├── types/                     # Definiciones de tipos de TypeScript (interfaces)
│   │   └── types.ts
│   └── utils/                     # Utilidades generales
│       └── cronParser.util.ts     # Utilidad para parsear expresiones cron
├── .env                           # Variables de entorno
├── .gitignore                     # Archivos y directorios a ignorar por Git
├── .prettierrc                    # Configuración de Prettier
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json                  # Configuración de TypeScript
Configuración del EntornoClonar el repositorio:git clone <URL_DEL_REPOSITORIO>
cd APIConsultasAutomatizadas
Instalar dependencias:npm install
Configurar variables de entorno:Crea un archivo .env en la raíz del proyecto con las siguientes variables:PORT=5000
MONGO_URL=mongodb://localhost:27017/nombre_de_tu_db_mongo
Configurar PostgreSQL con Docker (si no lo tienes):docker run --name my-customers-postgres -e POSTGRES_PASSWORD=19222425 -p 5432:5432 -d postgres
Luego, conéctate y crea la base de datos y la tabla customers:docker exec -it my-customers-postgres psql -U postgres
# Dentro del prompt de psql:
CREATE DATABASE my_customers_db;
\c my_customers_db;
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(50),
    country VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO customers (first_name, last_name, email, phone_number, address, city, country) VALUES
('Juan', 'Perez', 'juan.perez@example.com', '123-456-7890', 'Calle 10 # 5-15', 'Barranquilla', 'Colombia'),
('Maria', 'Gomez', 'maria.gomez@example.com', '987-654-3210', 'Avenida Siempre Viva 742', 'Bogotá', 'Colombia'),
('Carlos', 'Rodriguez', 'carlos.r@example.com', '555-123-4567', 'Elm Street 32', 'Medellín', 'Colombia'),
('Ana', 'Lopez', 'ana.l@example.com', '111-222-3333', 'Diagonal 45 # 10-20', 'Cartagena', 'Colombia');
\q
Ejecución del ProyectoPara iniciar el servidor y el scheduler:npm start
Esto compilará el código TypeScript y ejecutará el archivo dist/server.js.Esquema de la Base de Datos (MongoDB)El proyecto utiliza MongoDB para almacenar la configuración de las conexiones a bases de datos externas, las plantillas de consultas, las consultas programadas y el historial de resultados.DatabaseConnectionRepresenta los detalles de conexión a una base de datos externa.CampoTipoRequeridoÚnicoDescripción_idObjectIdSíSíID único de la conexiónnameStringSíSíNombre descriptivo de la conexióntypeStringSíNoTipo de base de datos (postgresql, mysql, sqlserver)connectionStringStringSíNoCadena de conexión completacreatedAtDateSíNoFecha de creaciónupdatedAtDateSíNoÚltima fecha de actualizaciónQueryTemplateDefine una plantilla de consulta SQL parametrizada.CampoTipoRequeridoÚnicoDescripción_idObjectIdSíSíID único de la plantillanameStringSíSíNombre descriptivo de la plantilladescriptionStringNoNoDescripción del propósito de la consultaquerySqlStringSíNoLa consulta SQL con marcadores de posición ${param}databaseConnectionIdObjectIdSíNoReferencia al _id de DatabaseConnectionparametersArraySíNoArreglo de objetos que describen los parámetros esperadosparameters.nameStringSíNoNombre del parámetro (debe coincidir con querySql)parameters.typeStringSíNoTipo de dato del parámetro (string, number, etc.)parameters.defaultValueMixedNoNoValor predeterminado del parámetrocreatedAtDateSíNoFecha de creaciónupdatedAtDateSíNoÚltima fecha de actualizaciónScheduledQueryRepresenta una consulta programada para ejecución recurrente.CampoTipoRequeridoÚnicoDescripción_idObjectIdSíSíID único de la consulta programadanameStringSíNoNombre de la tarea programadaqueryTemplateIdObjectIdSíNoReferencia al _id de QueryTemplateparametersValuesArraySíNoArreglo de objetos con valores para los parámetros de la plantillaparametersValues.nameStringSíNoNombre del parámetro (debe coincidir con QueryTemplate.parameters.name)parametersValues.valueMixedSíNoValor a usar para el parámetro en esta ejecucióncronExpressionStringSíNoExpresión cron para la programación (ej. 0 0 * * *)isActiveBooleanNoNoIndica si la consulta está activa (true por defecto)lastExecutionTimeDateNoNoÚltima vez que se ejecutó la consultanextExecutionTimeDateNoNoPróxima vez que se ejecutará la consultacreatedAtDateSíNoFecha de creaciónupdatedAtDateSíNoÚltima fecha de actualizaciónQueryResultHistoryAlmacena el historial de cada ejecución de una consulta programada.CampoTipoRequeridoÚnicoDescripción_idObjectIdSíSíID único del registro de historialscheduledQueryIdObjectIdSíNoReferencia al _id de ScheduledQuery que se ejecutóexecutionTimeDateSíNoFecha y hora de la ejecuciónstatusStringSíNoEstado de la ejecución (success o failed)resultMixedSíNoResultados de la consulta (si fue exitosa) o un objeto vacíoerrorMessageStringNoNoMensaje de error (si la ejecución falló)executedQuerySqlStringSíNoLa consulta SQL final que se ejecutócreatedAtDateSíNoFecha de creaciónupdatedAtDateSíNoÚltima fecha de actualizaciónEndpoints de la APITodos los endpoints están prefijados con /api.1. Conexiones a Bases de Datos (/api/connections)Gestión de las configuraciones para conectar a bases de datos externas.POST /api/connectionsDescripción: Crea una nueva conexión a una base de datos externa.Método: POSTParámetros (Body JSON):{
  "name": "MyCustomersPostgres",
  "type": "postgresql",
  "connectionString": "postgresql://usuario:password@host:5432/nombre_base_datos"
}
Respuestas:201 Created: { "_id": "...", "name": "...", ... } (Objeto de conexión creada)400 Bad Request: { "message": "..." } (Datos inválidos)409 Conflict: { "message": "Ya existe una conexión con este nombre." }500 Internal Server Error: { "message": "..." }GET /api/connectionsDescripción: Obtiene todas las conexiones a bases de datos registradas.Método: GETParámetros: Ninguno.Respuestas:200 OK: [ { "_id": "...", "name": "...", ... }, ... ] (Arreglo de conexiones)500 Internal Server Error: { "message": "..." }GET /api/connections/:idDescripción: Obtiene una conexión a base de datos específica por su ID.Método: GETParámetros (URL): id (ObjectId de la conexión)Respuestas:200 OK: { "_id": "...", "name": "...", ... } (Objeto de conexión)400 Bad Request: { "message": "ID de conexión de base de datos inválido." }404 Not Found: { "message": "Conexión de base de datos con ID ... no encontrada." }500 Internal Server Error: { "message": "..." }PUT /api/connections/:idDescripción: Actualiza los detalles de una conexión a base de datos existente.Método: PUTParámetros (URL): id (ObjectId de la conexión)Parámetros (Body JSON): Partial<DatabaseConnection> (Cualquier campo de la conexión que desees actualizar){
  "connectionString": "postgresql://nuevo_usuario:nueva_password@host:5432/nombre_db"
}
Respuestas:200 OK: { "_id": "...", "name": "...", ... } (Objeto de conexión actualizada)400 Bad Request: { "message": "ID de conexión de base de datos inválido." }404 Not Found: { "message": "No se encontró conexión de base de datos con ID ... para actualizar." }500 Internal Server Error: { "message": "..." }DELETE /api/connections/:idDescripción: Elimina una conexión a base de datos por su ID.Método: DELETEParámetros (URL): id (ObjectId de la conexión)Respuestas:204 No Content: (Eliminación exitosa)400 Bad Request: { "message": "ID de conexión de base de datos inválido." }404 Not Found: { "message": "No se encontró conexión de base de datos con ID ... para eliminar." }500 Internal Server Error: { "message": "..." }2. Plantillas de Consultas (/api/query-templates)Gestión de las plantillas SQL que se ejecutarán.POST /api/query-templatesDescripción: Crea una nueva plantilla de consulta SQL.Método: POSTParámetros (Body JSON):{
  "name": "CustomersByCityReport",
  "description": "Obtiene la lista de clientes de una ciudad específica.",
  "querySql": "SELECT id, first_name, last_name, email, city FROM customers WHERE city = ${target_city};",
  "databaseConnectionId": "60c72b2f9e1e2d001c8a1b2c",
  "parameters": [
    {
      "name": "target_city",
      "type": "string",
      "defaultValue": "Barranquilla"
    }
  ]
}
Respuestas:201 Created: { "_id": "...", "name": "...", ... } (Objeto de plantilla creada)400 Bad Request: { "message": "..." } (Datos inválidos o databaseConnectionId inválido)404 Not Found: { "message": "La conexión de base de datos con ID ... no existe." }409 Conflict: { "message": "Ya existe una plantilla de consulta con este nombre." }500 Internal Server Error: { "message": "..." }GET /api/query-templatesDescripción: Obtiene todas las plantillas de consulta registradas.Método: GETParámetros: Ninguno.Respuestas:200 OK: [ { "_id": "...", "name": "...", "databaseConnectionId": { "_id": "...", "name": "..." }, ... }, ... ] (Arreglo de plantillas con databaseConnectionId populado)500 Internal Server Error: { "message": "..." }GET /api/query-templates/:idDescripción: Obtiene una plantilla de consulta específica por su ID.Método: GETParámetros (URL): id (ObjectId de la plantilla)Respuestas:200 OK: { "_id": "...", "name": "...", "databaseConnectionId": { "_id": "...", "name": "..." }, ... } (Objeto de plantilla con databaseConnectionId populado)400 Bad Request: { "message": "ID de plantilla de consulta inválido." }404 Not Found: { "message": "No se encontró plantilla de consulta con ID ..." }500 Internal Server Error: { "message": "..." }PUT /api/query-templates/:idDescripción: Actualiza los detalles de una plantilla de consulta existente.Método: PUTParámetros (URL): id (ObjectId de la plantilla)Parámetros (Body JSON): Partial<QueryTemplate> (Cualquier campo de la plantilla que desees actualizar){
  "description": "Nueva descripción para el reporte de clientes."
}
Respuestas:200 OK: { "_id": "...", "name": "...", ... } (Objeto de plantilla actualizada)400 Bad Request: { "message": "..." } (ID inválido o databaseConnectionId inválido si se actualiza)404 Not Found: { "message": "No se encontró plantilla de consulta con ID ... para actualizar." }500 Internal Server Error: { "message": "..." }DELETE /api/query-templates/:idDescripción: Elimina una plantilla de consulta por su ID.Método: DELETEParámetros (URL): id (ObjectId de la plantilla)Respuestas:204 No Content: (Eliminación exitosa)400 Bad Request: { "message": "ID de plantilla de consulta inválido." }404 Not Found: { "message": "No se encontró plantilla de consulta con ID ... para eliminar." }500 Internal Server Error: { "message": "..." }3. Consultas Programadas (/api/scheduled-queries)Gestión de la programación y ejecución recurrente de consultas.POST /api/scheduled-queriesDescripción: Crea una nueva consulta programada. Esto activará la programación en el scheduler.Método: POSTParámetros (Body JSON):{
  "name": "DailyCustomersInBarranquilla",
  "queryTemplateId": "60c72b3a9e1e2d001c8a1b2d",
  "parametersValues": [
    {
      "name": "target_city",
      "value": "Barranquilla"
    }
  ],
  "cronExpression": "0 0 * * *",
  "isActive": true
}
Respuestas:201 Created: { "_id": "...", "name": "...", ... } (Objeto de consulta programada creada)400 Bad Request: { "message": "..." } (Datos inválidos, queryTemplateId inválido, o expresión cron inválida)404 Not Found: { "message": "La plantilla de consulta con ID ... no existe." }409 Conflict: { "message": "Ya existe una consulta programada con esta configuración." }500 Internal Server Error: { "message": "..." }GET /api/scheduled-queriesDescripción: Obtiene todas las consultas programadas.Método: GETParámetros: Ninguno.Respuestas:200 OK: [ { "_id": "...", "name": "...", "queryTemplateId": { "_id": "...", "name": "..." }, ... }, ... ] (Arreglo de consultas programadas con queryTemplateId populado)500 Internal Server Error: { "message": "..." }GET /api/scheduled-queries/:idDescripción: Obtiene una consulta programada específica por su ID.Método: GETParámetros (URL): id (ObjectId de la consulta programada)Respuestas:200 OK: { "_id": "...", "name": "...", "queryTemplateId": { "_id": "...", "name": "..." }, ... } (Objeto de consulta programada con queryTemplateId populado)400 Bad Request: { "message": "ID de consulta programada inválido." }404 Not Found: { "message": "No se encontró consulta programada con ID ..." }500 Internal Server Error: { "message": "..." }PUT /api/scheduled-queries/:idDescripción: Actualiza los detalles de una consulta programada existente. Esto recargará el scheduler para aplicar los cambios.Método: PUTParámetros (URL): id (ObjectId de la consulta programada)Parámetros (Body JSON): Partial<ScheduledQuery> (Cualquier campo que desees actualizar){
  "isActive": false,
  "cronExpression": "0 0 * * 1"
}
Respuestas:200 OK: { "_id": "...", "name": "...", ... } (Objeto de consulta programada actualizada)400 Bad Request: { "message": "..." } (ID inválido, queryTemplateId inválido si se actualiza, o expresión cron inválida)404 Not Found: { "message": "No se encontró consulta programada con ID ... para actualizar." }500 Internal Server Error: { "message": "..." }DELETE /api/scheduled-queries/:idDescripción: Elimina una consulta programada por su ID. Esto también la eliminará del scheduler.Método: DELETEParámetros (URL): id (ObjectId de la consulta programada)Respuestas:204 No Content: (Eliminación exitosa)400 Bad Request: { "message": "ID de consulta programada inválido." }404 Not Found: { "message": "No se encontró consulta programada con ID ... para eliminar." }500 Internal Server Error: { "message": "..." }4. Historial de Resultados (/api/query-history)Consulta el historial de ejecuciones de las consultas programadas.GET /api/query-historyDescripción: Obtiene todo el historial de resultados de las consultas ejecutadas.Método: GETParámetros: Ninguno.Respuestas:200 OK: [ { "_id": "...", "scheduledQueryId": { "_id": "...", "name": "...", "queryTemplateId": { "_id": "...", "name": "..." } }, "status": "success", "result": [...], ... }, ... ] (Arreglo de registros de historial con scheduledQueryId y queryTemplateId populados)500 Internal Server Error: { "message": "..." }GET /api/query-history/:idDescripción: Obtiene un registro de historial específico por su ID.Método: GETParámetros (URL): id (ObjectId del registro de historial)Respuestas:200 OK: { "_id": "...", "scheduledQueryId": { "_id": "...", "name": "...", "queryTemplateId": { "_id": "...", "name": "..." } }, "status": "success", "result": [...], ... } (Objeto de registro de historial con scheduledQueryId y queryTemplateId populados)400 Bad Request: { "message": "ID de historial de resultado inválido." }404 Not Found: { "message": "No se encontró historial de resultado con ID ..." }500 Internal Server Error: { "message": "..." }GET /api/query-history/scheduled-query/:scheduledQueryIdDescripción: Obtiene todos los registros de historial para una consulta programada específica.Método: GETParámetros (URL): scheduledQueryId (ObjectId de la consulta programada)Respuestas:200 OK: [ { "_id": "...", "scheduledQueryId": { "_id": "...", "name": "...", "queryTemplateId": { "_id": "...", "name": "..." } }, "status": "success", "result": [...], ... }, ... ] (Arreglo de registros de historial filtrados y populados)400 Bad Request: { "message": "ID de consulta programada inválido." }500 Internal Server Error: { "message": "..." }