-- Versión de sesión del usuario: invalida los JWT emitidos antes de cambiar la contraseña
ALTER TABLE "users" ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;
