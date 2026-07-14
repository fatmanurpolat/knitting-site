import path from 'node:path';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import { CatalogQueries } from '../../../domain/ports/in/CatalogQueries';
import { AppConfig } from '../../../infrastructure/config';
import { registerPageRoutes } from './routes/pages';
import { baseViewModel } from './viewModel';

export interface ServerDeps {
  config: AppConfig;
  catalog: CatalogQueries;
}

/**
 * Builds (but does not start) the Fastify application: security headers, the
 * EJS view engine, static assets, and the page routes. Kept separate from
 * start-up so it can be unit-tested with `app.inject(...)`.
 */
export async function buildServer({ config, catalog }: ServerDeps): Promise<FastifyInstance> {
  const app = Fastify({
    // In test the logger is off entirely (which also disables request logging).
    logger: config.env !== 'test' ? { level: config.env === 'production' ? 'info' : 'debug' } : false,
  });

  // A few sensible security headers (no extra deps). See Klip's hardened
  // headers for the same spirit.
  app.addHook('onSend', async (_req, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('X-DNS-Prefetch-Control', 'off');
    return payload;
  });

  await app.register(fastifyView, {
    engine: { ejs },
    root: config.viewsDir,
    viewExt: 'ejs',
    // Makes brand/nav available to any include without re-passing them.
    defaultContext: { brandName: config.brand.name },
  });

  await app.register(fastifyStatic, {
    root: path.resolve(config.publicDir),
    prefix: '/',
    index: false,
    // Cache assets in production; always revalidate in dev.
    cacheControl: config.env === 'production',
    maxAge: config.env === 'production' ? '7d' : 0,
  });

  await registerPageRoutes(app, { config, catalog });

  // Friendly 404 that still looks like the site.
  app.setNotFoundHandler(async (req, reply) => {
    reply.code(404);
    return reply.view('pages/not-found.ejs', {
      ...baseViewModel(config, 'home', new Date().getFullYear()),
      requestedPath: req.url,
    });
  });

  return app;
}
