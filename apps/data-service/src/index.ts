import Fastify from 'fastify';
import { healthRoutes } from './routes/health.js';

export async function createServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(healthRoutes);

  return app;
}

const start = async () => {
  const app = await createServer();
  const port = Number(process.env.PORT) || 3002;
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Data Service listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
