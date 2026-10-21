import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest, // 👈 El segundo argumento SIEMPRE debe ser request
  reply: FastifyReply     // 👈 El tercer argumento SIEMPRE debe ser reply
  
): void {
  // Manejar errores de Zod
  if (error instanceof ZodError) {
    const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    reply.status(400).send({
      error: 'Validation Error',
      message: 'Error de validación en los datos',
      details: messages,
    });
    return;
  }

  // Manejar errores de la aplicación
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
    return;
  }

  // Manejar errores de PostgreSQL
  const pgError = error as any;
  if ((pgError).code === '23505') {
    reply.status(409).send({
      error: 'Conflict',
      message: 'Ya existe un registro con esos datos (duplicado)',
    });
    return;
  }

  if ((pgError).code === '23503') {
    reply.status(400).send({
      error: 'ForeignKeyViolation',
      message: 'Referencia inválida a otro registro',
    });
    return;
  }

  // Error genérico
  console.error('Unhandled error:', error);
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Ocurrió un error interno del servidor',
  });
}
