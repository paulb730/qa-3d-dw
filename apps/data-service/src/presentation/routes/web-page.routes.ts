import type { FastifyInstance } from 'fastify';
import { WebPageRepository } from '../../infrastructure/database/repositories/web-page.repository.js';
import { db } from '../../infrastructure/database/connection.js';
import { createWebPageSchema } from '../schemas/web-page.schema.js';
import { NotFoundError, ValidationError } from '../middleware/error-handler.js';

export async function webPageRoutes(app: FastifyInstance): Promise<void> {
  const webPageRepo = new WebPageRepository(db);

  // GET /api/web-pages - Listar páginas
  app.get('/api/web-pages', async () => {
    const pages = await webPageRepo.findAll();
    return { data: pages, count: pages.length };
  });

  // GET /api/web-pages/user/:userId - Páginas de un usuario
  app.get('/api/web-pages/user/:userId', async (request) => {
    const { userId } = request.params as { userId: string };
    const pages = await webPageRepo.findByUserId(userId);
    return { data: pages, count: pages.length };
  });

  // POST /api/web-pages - Crear página
  app.post('/api/web-pages', async (request, reply) => {
    const body = createWebPageSchema.parse(request.body);
    const { user_id } = request.body as { user_id: string };
    
    if (!user_id) {
      throw new ValidationError('user_id es requerido');
    }
    
    const page = await webPageRepo.create({
      user_id,
      url: body.url,
      name: body.name,
      description: body.description || null,
    });
    
    return reply.status(201).send({ data: page, message: 'Página web registrada exitosamente' });
  });

  // DELETE /api/web-pages/:id - Eliminar página
  app.delete('/api/web-pages/:id', async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await webPageRepo.delete(id);
    
    if (!deleted) {
      throw new NotFoundError('Página web');
    }
    
    return { message: 'Página web eliminada exitosamente' };
  });
}
