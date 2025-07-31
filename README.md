Documentación Técnica de la API de Consultas Automatizadas
Esta documentación detalla la arquitectura, los modelos de datos, el flujo de trabajo y los endpoints de la API de Consultas Automatizadas, diseñada para gestionar conexiones a bases de datos, programar y ejecutar consultas, generar reportes y gestionar usuarios.

1. Arquitectura y Estructura del Proyecto
El proyecto sigue una arquitectura modular y basada en capas, utilizando TypeScript y Node.js con Express.js y Mongoose para la interacción con MongoDB.

.
├── src/
│   ├── controllers/            # Lógica de manejo de peticiones HTTP
│   │   ├── auth.controller.ts
│   │   ├── databaseConnection.controller.ts
│   │   ├── queryResultHistory.controller.ts
│   │   ├── queryTemplate.controller.ts
│   │   ├── reportHistory.controller.ts
│   │   ├── scheduledQuery.controller.ts
│   │   └── user.controller.ts
│   ├── database/               # Configuración y utilidades de conexión a bases de datos
│   │   ├── externalDatabaseConnection.ts  # Conexión a DBs externas (PostgreSQL, MySQL)
│   │   └── mongo.database.ts              # Conexión a MongoDB
│   ├── errors/                 # Clases de errores personalizadas
│   │   └── error.ts
│   ├── middlewares/            # Middlewares de Express (autenticación, autorización, manejo de errores)
│   │   ├── custom/
│   │   │   └── errorHandler.ts
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   ├── models/                 # Lógica de negocio y abstracción de la base de datos (servicios)
│   │   ├── databaseConnection.model.ts
│   │   ├── queryResultHistory.model.ts
│   │   ├── queryTemplate.model.ts
│   │   ├── reportHistory.model.ts
│   │   ├── scheduledQuery.model.ts
│   │   └── user.model.ts
│   ├── routes/                 # Definición de rutas API
│   │   ├── auth.routes.ts
│   │   ├── databaseConnection.routes.ts
│   │   ├── queryResultHistory.routes.ts
│   │   ├── queryTemplate.routes.ts
│   │   ├── reportHistory.routes.ts
│   │   ├── scheduledQuery.routes.ts
│   │   └── user.routes.ts
│   ├── schemas/                # Definiciones de esquemas de Mongoose
│   │   ├── databaseConnection.schema.ts
│   │   ├── queryResultHistory.schema.ts
│   │   ├── queryTemplate.schema.ts
│   │   ├── reportHistory.schema.ts
│   │   ├── scheduledQuery.schema.ts
│   │   └── user.schema.ts
│   ├── services/               # Lógica de negocio central y orquestación
│   │   ├── email.service.ts
│   │   ├── mainScheduler.service.ts
│   │   ├── onDemandQuery.service.ts
│   │   └── reportOrchestrator.service.ts
│   ├── types/                  # Definiciones de interfaces y tipos TypeScript
│   │   └── types.ts
│   └── utils/                  # Utilidades generales
│       ├── auth.util.ts        # Servicio de autenticación (renombrado de auth.service.ts)
│       ├── cronParser.util.ts
│       └── csvGenerator.util.ts
├── .env                        # Variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── server.ts                   # Punto de entrada de la aplicación

2. Modelos de Datos y Relaciones (MongoDB)
La aplicación utiliza MongoDB para almacenar su configuración y datos operativos. A continuación, se describen los esquemas y sus relaciones.

2.1. User (Usuarios)
Propósito: Almacena la información de los usuarios del sistema, incluyendo credenciales y roles para el control de acceso.

Esquema (src/schemas/user.schema.ts):

username: String, único, requerido, mínimo 3 caracteres.

password: String, requerido, mínimo 6 caracteres, select: false (no se devuelve por defecto), hasheado con bcryptjs.

role: String, requerido, inmutable, enum: ['Admin', 'Client', 'User'], default: 'User'.

createdAt: Date (timestamp automático).

updatedAt: Date (timestamp automático).

Relaciones:

No tiene relaciones directas con otras colecciones, pero su _id y role se utilizan en los JWT para autenticación y autorización.

2.2. DatabaseConnection (Conexiones a Bases de Datos Externas)
Propósito: Almacena los detalles de conexión a bases de datos externas (PostgreSQL, MySQL) donde se ejecutarán las consultas.

Esquema (src/schemas/databaseConnection.schema.ts):

name: String, único, requerido.

type: String, requerido, enum: ['postgresql', 'mysql'].

connectionString: String, requerido (contiene las credenciales y el host/puerto/db).

createdAt: Date (timestamp automático).

updatedAt: Date (timestamp automático).

Relaciones:

One-to-Many: Una DatabaseConnection puede ser referenciada por muchas QueryTemplate.

Referenciada por QueryTemplate a través de databaseConnectionId.

2.3. QueryTemplate (Plantillas de Consulta)
Propósito: Define consultas SQL reutilizables que pueden ser ejecutadas contra una DatabaseConnection específica. Incluye placeholders para parámetros.

Esquema (src/schemas/queryTemplate.schema.ts):

name: String, único, requerido.

description: String, opcional.

querySql: String, requerido (la consulta SQL con placeholders como ${param_name}).

parameters: Array de objetos, opcional. Cada objeto tiene:

name: String (nombre del parámetro).

type: String (tipo de dato del parámetro, ej. 'string', 'number').

defaultValue: Any (valor por defecto si no se proporciona).

databaseConnectionId: ObjectId, requerido, referencia a DatabaseConnection.

createdAt: Date (timestamp automático).

updatedAt: Date (timestamp automático).

Relaciones:

Many-to-One: Muchas QueryTemplate pertenecen a una DatabaseConnection.

One-to-Many: Una QueryTemplate puede ser utilizada por muchas ScheduledQuery.

Referenciada por ScheduledQuery a través de queryTemplateId.

2.4. ScheduledQuery (Consultas Programadas)
Propósito: Configura la ejecución automática de una QueryTemplate en intervalos definidos, con opciones para generación y envío de reportes.

Esquema (src/schemas/scheduledQuery.schema.ts):

name: String, requerido.

queryTemplateId: ObjectId, requerido, referencia a QueryTemplate.

parametersValues: Array de objetos, opcional. Cada objeto tiene:

name: String (nombre del parámetro).

value: Any (valor a usar para el parámetro).

cronExpression: String, requerido (ej. * * * * * para cada minuto).

isActive: Boolean, default: true.

lastExecutionTime: Date, opcional (última vez que se ejecutó).

nextExecutionTime: Date, opcional (próxima ejecución programada).

reportConfig: Object, opcional. Contiene:

format: String, requerido, enum: ['CSV'].

emailRecipients: Array de String (correos).

emailSubjectTemplate: String, opcional (plantilla para el asunto).

emailBodyTemplate: String, opcional (plantilla para el cuerpo).

fileNameTemplate: String, opcional (plantilla para el nombre del archivo).

createdAt: Date (timestamp automático).

updatedAt: Date (timestamp automático).

Relaciones:

Many-to-One: Muchas ScheduledQuery utilizan una QueryTemplate.

One-to-Many: Una ScheduledQuery puede generar muchos QueryResultHistory y ReportHistory.

Referenciada por QueryResultHistory a través de scheduledQueryId.

Referenciada por ReportHistory a través de scheduledQueryId.

2.5. QueryResultHistory (Historial de Resultados de Consulta)
Propósito: Almacena los resultados de cada ejecución de una consulta (ya sea programada o bajo demanda).

Esquema (src/schemas/queryResultHistory.schema.ts):

scheduledQueryId: ObjectId, requerido, referencia a ScheduledQuery.

executionTime: Date, requerido.

status: String, requerido, enum: ['success', 'failed'].

result: Mixed, requerido (los datos devueltos por la consulta o un mensaje).

errorMessage: String, opcional (si la ejecución falló).

executedQuerySql: String, requerido (la SQL final ejecutada).

createdAt: Date (timestamp automático).

updatedAt: Date (timestamp automático).

Relaciones:

Many-to-One: Muchos QueryResultHistory pertenecen a una ScheduledQuery.

One-to-One (opcional): Un QueryResultHistory puede ser referenciado por un ReportHistory (si el reporte se generó a partir de esa ejecución).

Referenciada por ReportHistory a través de associatedQueryResultId.

2.6. ReportHistory (Historial de Reportes Generados)
Propósito: Almacena metadatos sobre cada reporte generado y enviado por email.

Esquema (src/schemas/reportHistory.schema.ts):

scheduledQueryId: ObjectId, opcional, referencia a ScheduledQuery (si el reporte es programado).

queryTemplateId: ObjectId, opcional, referencia a QueryTemplate (si el reporte es bajo demanda o asociado a una plantilla).

generatedAt: Date, requerido.

status: String, requerido, enum: ['success', 'failed'].

fileName: String, requerido (nombre del archivo CSV).

fileSizeKB: Number, opcional (tamaño del archivo).

recipients: Array de String, requerido (destinatarios del email).

emailStatus: String, requerido, enum: ['sent', 'failed', 'not_applicable'].

errorMessage: String, opcional (si el proceso de reporte falló).

associatedQueryResultId: ObjectId, opcional, referencia a QueryResultHistory.

createdAt: Date (timestamp automático).

updatedAt: Date (timestamp automático).

Relaciones:

Many-to-One: Muchos ReportHistory pueden pertenecer a una ScheduledQuery o a una QueryTemplate.

Many-to-One (opcional): Muchos ReportHistory pueden referenciar un QueryResultHistory.

3. Flujo de Trabajo Detallado
El sistema opera en un ciclo continuo, orquestando la programación, ejecución y entrega de reportes.

3.1. Inicio del Servidor y Scheduler (server.ts, mainScheduler.service.ts)
server.ts inicia la aplicación Express.js, configura middlewares (CORS, JSON parsing) y conecta a MongoDB (mongo.database.ts).

Llama a mainSchedulerService.start().

mainSchedulerService.start() inicia el proceso:

Carga todas las ScheduledQuery activas desde MongoDB. Crucialmente, popula queryTemplateId y databaseConnectionId para tener todos los detalles de la consulta y conexión disponibles en memoria.

Programa cada ScheduledQuery usando node-cron con su cronExpression.

Establece una tarea node-cron para recargar todas las consultas programadas cada hora (o según configuración), asegurando que los cambios en la base de datos se reflejen en el scheduler.

3.2. Ciclo de Ejecución de una Consulta Programada (mainScheduler.service.ts -> reportOrchestrator.service.ts)
Cuando una ScheduledQuery se activa según su cronExpression:

El callback de node-cron en mainScheduler.service.ts se ejecuta.

Llama a reportOrchestrator.service.ts.generateAndSendScheduledReport(scheduledQuery).

Actualiza lastExecutionTime y nextExecutionTime en la ScheduledQuery en MongoDB.

3.3. Orquestación del Reporte (reportOrchestrator.service.ts)
Validación Inicial: Verifica si la scheduledQuery tiene reportConfig.

Obtención de Plantilla: Accede a la QueryTemplate y DatabaseConnection que ya vienen populadas en scheduledQuery. No se realiza una nueva consulta a la base de datos para obtenerlas.

Generación de Metadatos: Calcula el fileName, subject y body del email utilizando las plantillas y los datos de la scheduledQuery (ej. {{name}}, {{date}}). Estos valores se asignan a reportData desde el inicio para asegurar su presencia en caso de error.

Ejecución de la Consulta (onDemandQuery.service.ts):

Llama a onDemandQuery.service.ts.executeQuery(queryTemplate, scheduledQuery.parametersValues).

onDemandQuery.service.ts toma la queryTemplate (que incluye querySql y databaseConnectionId).

Reemplaza los placeholders en querySql con los parametersValues proporcionados.

Utiliza externalDatabaseConnection.ts para conectar y ejecutar la consulta en la base de datos externa (PostgreSQL/MySQL).

Maneja reintentos con retardo exponencial si la ejecución de la consulta externa falla.

Devuelve los resultados de la consulta.

Registro de Historial de Consulta (queryResultHistory.model.ts):

Después de la ejecución de la consulta, reportOrchestrator.service.ts registra el resultado (éxito o fallo) en la colección QueryResultHistory.

Generación de CSV (csvGenerator.util.ts):

Llama a csvGenerator.util.ts.generateCsv(queryResults) para convertir los resultados de la consulta en una cadena CSV.

Envío de Email (email.service.ts):

Llama a email.service.ts.sendEmail() con los destinatarios, asunto, cuerpo y el contenido CSV como adjunto.

Maneja reintentos con retardo exponencial para el envío del email.

Registro de Historial de Reporte (reportHistory.model.ts):

Finalmente, reportOrchestrator.service.ts registra el estado final del proceso de reporte (éxito o fallo, incluyendo errores) en la colección ReportHistory.

Manejo de Errores: Cualquier error en el proceso es capturado, logueado y propagado como un ApiError.

4. Endpoints de la API y Funcionalidades
Todos los endpoints están prefijados con /api/. Las rutas protegidas requieren un JWT válido en la cabecera Authorization: Bearer <token>. Los roles (Admin, Client, User) definen los permisos.

4.1. Autenticación (/api/auth)
POST /api/auth/register

Descripción: Registra un nuevo usuario en el sistema.

Request Body: { "username": "string", "password": "string", "role": "Admin" | "Client" | "User" }

Response: { "message": "string", "user": IUserMongoose (sin password), "token": "string" }

Permisos: Público.

POST /api/auth/login

Descripción: Autentica a un usuario existente y devuelve un JWT.

Request Body: { "username": "string", "password": "string" }

Response: { "message": "string", "user": IUserMongoose (sin password), "token": "string" }

Permisos: Público.

4.2. Usuarios (/api/users)
GET /api/users/:id

Descripción: Obtiene los detalles de un usuario específico por su ID.

Permisos: Admin.

GET /api/users

Descripción: Obtiene una lista de todos los usuarios registrados.

Permisos: Admin.

PUT /api/users/:id

Descripción: Actualiza los datos de un usuario existente. El rol no puede ser modificado.

Permisos: Admin.

DELETE /api/users/:id

Descripción: Elimina un usuario del sistema.

Permisos: Admin.

4.3. Conexiones a Bases de Datos (/api/connections)
GET /api/connections

Descripción: Obtiene una lista de todas las configuraciones de conexión a bases de datos.

Permisos: Admin, Client, User.

GET /api/connections/:id

Descripción: Obtiene los detalles de una configuración de conexión específica por su ID.

Permisos: Admin, Client, User.

POST /api/connections

Descripción: Crea una nueva configuración de conexión a una base de datos externa.

Permisos: Admin, Client, User.

PUT /api/connections/:id

Descripción: Actualiza una configuración de conexión existente.

Permisos: Admin.

DELETE /api/connections/:id

Descripción: Elimina una configuración de conexión.

Permisos: Admin.

4.4. Plantillas de Consulta (/api/query-templates)
GET /api/query-templates

Descripción: Obtiene una lista de todas las plantillas de consulta disponibles.

Permisos: Admin, Client, User.

GET /api/query-templates/:id

Descripción: Obtiene los detalles de una plantilla de consulta específica por su ID.

Permisos: Admin, Client, User.

POST /api/query-templates

Descripción: Crea una nueva plantilla de consulta.

Permisos: Admin, Client, User.

PUT /api/query-templates/:id

Descripción: Actualiza una plantilla de consulta existente.

Permisos: Admin, Client, User.

DELETE /api/query-templates/:id

Descripción: Elimina una plantilla de consulta.

Permisos: Admin, Client, User.

4.5. Consultas Programadas (/api/scheduled-queries)
GET /api/scheduled-queries

Descripción: Obtiene una lista de todas las consultas programadas.

Permisos: Admin, Client, User.

GET /api/scheduled-queries/:id

Descripción: Obtiene los detalles de una consulta programada específica por su ID.

Permisos: Admin, Client, User.

POST /api/scheduled-queries

Descripción: Crea una nueva consulta programada.

Permisos: Admin, Client, User.

PUT /api/scheduled-queries/:id

Descripción: Actualiza una consulta programada existente.

Permisos: Admin, Client, User.

DELETE /api/scheduled-queries/:id

Descripción: Elimina una consulta programada.

Permisos: Admin, Client, User.

4.6. Historial de Resultados de Consulta (/api/query-history)
GET /api/query-history

Descripción: Obtiene todos los registros del historial de resultados de consultas.

Permisos: Admin.

GET /api/query-history/:id

Descripción: Obtiene un registro específico del historial de resultados por su ID.

Permisos: Admin.

GET /api/query-history/scheduled/:scheduledQueryId

Descripción: Obtiene los registros del historial de resultados asociados a una ScheduledQuery específica.

Permisos: Admin.

4.7. Historial de Reportes Generados (/api/report-history)
GET /api/report-history

Descripción: Obtiene todos los registros del historial de reportes generados.

Permisos: Admin, User.

GET /api/report-history/:id

Descripción: Obtiene un registro específico del historial de reportes por su ID.

Permisos: Admin, User.

GET /api/report-history/scheduled/:scheduledQueryId

Descripción: Obtiene los registros del historial de reportes asociados a una ScheduledQuery específica.

Permisos: Admin, User.

5. Roles de Usuario y Permisos
La API implementa un control de acceso basado en roles (RBAC) con los siguientes roles:

Admin:

Acceso total a todas las funcionalidades CRUD de usuarios, conexiones, plantillas, consultas programadas, y ambos historiales (resultados y reportes).

Puede crear, leer, actualizar y eliminar cualquier recurso.

Client:

Puede leer (GET) y crear (POST) conexiones, plantillas y consultas programadas.

No puede actualizar ni eliminar conexiones, plantillas ni consultas programadas.

No tiene acceso directo a la gestión de usuarios ni a los historiales de resultados y reportes (a menos que se especifique en la ruta).

User:

Puede leer (GET) conexiones, plantillas y consultas programadas.

No puede crear, actualizar ni eliminar conexiones, plantillas ni consultas programadas.

Puede leer su propio historial de reportes (si se implementa lógica de "propiedad").

No tiene acceso directo a la gestión de usuarios ni al historial de resultados de consultas.

Nota sobre permisos: Los permisos actuales en las rutas que me proporcionaste son un punto de partida. Por ejemplo, en DatabaseConnectionRouter, QueryTemplateRouter y ScheduledQueryRouter, Client y User tienen permisos de POST y PUT/DELETE en algunas rutas. Esto puede ser ajustado según los requisitos exactos de tu prueba técnica. La documentación refleja los permisos tal como están definidos en tus rutas actuales.

6. Variables de Entorno Clave (.env)
PORT: Puerto en el que corre el servidor Express (ej. 5000).

MONGO_URI: Cadena de conexión a la base de datos MongoDB (ej. mongodb://localhost:27017/my_database).

JWT_SECRET: Clave secreta para firmar y verificar los JWT. Debe ser una cadena larga y compleja.

SMTP_HOST: Host del servidor SMTP para el envío de correos (ej. smtp.gmail.com).

SMTP_PORT: Puerto del servidor SMTP (ej. 587).

SMTP_USER: Usuario del servidor SMTP (ej. tu_correo@gmail.com).

SMTP_PASS: Contraseña o contraseña de aplicación del servidor SMTP (ej. tu_password_de_aplicacion).

SENDER_EMAIL_NAME: Nombre del remitente para los correos electrónicos (ej. "Sistema de Reportes Automatizados").
