-- Se ejecuta UNA sola vez, cuando el volumen de Postgres está vacío (primer `npm run db:up`).
-- Una base por microservicio. Para recrearlas: `npm run db:reset` (borra TODOS los datos).
CREATE DATABASE auth_db;
CREATE DATABASE content_db;
CREATE DATABASE gameplay_db;
CREATE DATABASE progress_db;
CREATE DATABASE rewards_db;
