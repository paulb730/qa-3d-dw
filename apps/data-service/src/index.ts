import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './presentation/routes/user.routes.js';
import { e2eTestRoutes } from './presentation/routes/e2e-test.routes.js';
import { webPageRoutes } from './presentation/routes/web-page.routes.js';
import { errorHandler } from './presentation/middleware/error-handler.js';
import { testConnection } from './infrastructure/database/connection.js';

console.log('🚀 [DATA-SERVICE] Iniciando servidor completo...');

export async function createServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'production',
  });

  // ============================================
  // Plugins de seguridad
  // ============================================
  await app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://qa-3d-frontend.onrender.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ============================================
  // Rutas
  // ============================================
  await app.register(healthRoutes);
  await app.register(userRoutes);
  await app.register(e2eTestRoutes);
  await app.register(webPageRoutes);

  // ============================================
  // Manejo de errores global
  // ============================================
  app.setErrorHandler(errorHandler);

  return app;
}

// Iniciar el servidor
const start = async () => {
  // Probar conexión a BD
  await testConnection();

  const app = await createServer();
  const port = Number(process.env.PORT) || 3002;

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Data Service en http://localhost:${port}`);

  } catch (err) {
    console.error('❌ Error al iniciar:', err);
    process.exit(1);
  }
};

start();