import { loadConfig } from './infrastructure/config';
import { buildContainer } from './infrastructure/container';
import { buildServer } from './adapters/in/web/server';

/**
 * Program entrypoint: load config → wire the container → build the server →
 * listen. Also handles graceful shutdown so systemd (see ansible/) can stop
 * and restart the service cleanly.
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const container = buildContainer(config);
  const app = await buildServer({ config, catalog: container.catalog });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
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
