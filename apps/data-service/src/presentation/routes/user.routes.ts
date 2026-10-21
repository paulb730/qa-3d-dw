import type { FastifyInstance } from 'fastify';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository.js';
import { db } from '../../infrastructure/database/connection.js';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../schemas/user.schema.js';
import { NotFoundError } from '../middleware/error-handler.js';
import bcrypt from 'bcryptjs';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const userRepo = new UserRepository(db);

  // GET /api/users - Listar usuarios
  app.get('/api/users', async () => {
    const users = await userRepo.findAll();
    return { data: users, count: users.length };
  });

  // GET /api/users/:id - Obtener usuario por ID
  app.get('/api/users/:id', async (request) => {
    const { id } = userIdParamSchema.parse(request.params);
    const user = await userRepo.findById(id);
    
    if (!user) {
      throw new NotFoundError('Usuario');
    }
    
    return { data: user };
  });

  // POST /api/users - Crear usuario
  app.post('/api/users', async (request, reply) => {
    const body = createUserSchema.parse(request.body);
    
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    const user = await userRepo.create({
      email: body.email,
      password_hash: passwordHash,
      name: body.name,
      role: body.role || 'qa_engineer',
      avatar_url: '',
    });
    
    return reply.status(201).send({ data: user, message: 'Usuario creado exitosamente' });
  });

  // PUT /api/users/:id - Actualizar usuario
  app.put('/api/users/:id', async (request) => {
    const { id } = userIdParamSchema.parse(request.params);
    const body = updateUserSchema.parse(request.body);
    
    const user = await userRepo.update(id, body);
    
    if (!user) {
      throw new NotFoundError('Usuario');
    }
    
    return { data: user, message: 'Usuario actualizado exitosamente' };
  });

  // DELETE /api/users/:id - Eliminar usuario
  app.delete('/api/users/:id', async (request) => {
    const { id } = userIdParamSchema.parse(request.params);
    const deleted = await userRepo.delete(id);
    
    if (!deleted) {
      throw new NotFoundError('Usuario');
    }
    
    return { message: 'Usuario eliminado exitosamente' };
  });
}
