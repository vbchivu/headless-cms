import fastify from 'fastify';
import cors from '@fastify/cors';

const app = fastify({ logger: true });

// Register synchronously (no top‐level await):
app.register(cors, {
  origin: ['http://localhost:3000'],
});

app.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('API running on http://localhost:3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
