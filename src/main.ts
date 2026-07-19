import { loadConfig } from './infrastructure/config';
import { buildContainer } from './infrastructure/container';
import { buildServer } from './adapters/in/web/server';

/**
 * Entrypoint: load config → wire the container (runs DB migrations/seed when a
 * database is configured) → build the server → listen. Graceful shutdown closes
 * the HTTP server and the DB pool.
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const container = await buildContainer(config);
  const app = await buildServer({
    config,
    catalog: container.catalog,
    admin: container.admin,
    images: container.images,
  });

  app.log.info(
    { storage: container.usingDatabase ? 'postgres' : 'in-memory' },
    'catalog storage selected',
  );

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
    await container.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
