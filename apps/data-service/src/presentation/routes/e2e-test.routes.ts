import type { FastifyInstance } from 'fastify';
import { E2eTestRepository } from '../../infrastructure/database/repositories/e2e-test.repository.js';
import { db } from '../../infrastructure/database/connection.js';
import { createE2eTestSchema, updateE2eTestSchema } from '../schemas/e2e-test.schema.js';
import { NotFoundError, ValidationError } from '../middleware/error-handler.js';

export async function e2eTestRoutes(app: FastifyInstance): Promise<void> {
  const e2eTestRepo = new E2eTestRepository(db);

  // GET /api/e2e-tests - Listar todas las pruebas
  app.get('/api/e2e-tests', async () => {
    const tests = await e2eTestRepo.findAll();
    return { data: tests, count: tests.length };
  });

  // GET /api/e2e-tests/user/:userId - Pruebas de un usuario
  app.get('/api/e2e-tests/user/:userId', async (request) => {
    const { userId } = request.params as { userId: string };
    const tests = await e2eTestRepo.findByUserId(userId);
    return { data: tests, count: tests.length };
  });

  // GET /api/e2e-tests/:id - Obtener prueba por ID
  app.get('/api/e2e-tests/:id', async (request) => {
    const { id } = request.params as { id: string };
    const test = await e2eTestRepo.findById(id);
    
    if (!test) {
      throw new NotFoundError('Prueba E2E');
    }
    
    return { data: test };
  });

  // POST /api/e2e-tests - Crear prueba
  app.post('/api/e2e-tests', async (request, reply) => {
    const body = createE2eTestSchema.parse(request.body);
    const { user_id } = request.body as { user_id: string };
    
    if (!user_id) {
      throw new ValidationError('user_id es requerido');
    }
    
    const test = await e2eTestRepo.create({
      user_id,
      name: body.name,
      description: body.description || null,
      status: 'draft',
      canvas_config_json: body.canvas_config_json || {},
    });
    
    return reply.status(201).send({ data: test, message: 'Prueba E2E creada exitosamente' });
  });

  // PUT /api/e2e-tests/:id - Actualizar prueba
  app.put('/api/e2e-tests/:id', async (request) => {
    const { id } = request.params as { id: string };
    const body = updateE2eTestSchema.parse(request.body);
    
    const test = await e2eTestRepo.update(id, body);
    
    if (!test) {
      throw new NotFoundError('Prueba E2E');
    }
    
    return { data: test, message: 'Prueba E2E actualizada exitosamente' };
  });

  // DELETE /api/e2e-tests/:id - Eliminar prueba
  app.delete('/api/e2e-tests/:id', async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await e2eTestRepo.delete(id);
    
    if (!deleted) {
      throw new NotFoundError('Prueba E2E');
    }
    
    return { message: 'Prueba E2E eliminada exitosamente' };
  });
}
