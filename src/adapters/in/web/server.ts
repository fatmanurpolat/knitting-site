import path from 'node:path';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastifyCookie from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import ejs from 'ejs';
import { CatalogQueries } from '../../../domain/ports/in/CatalogQueries';
import { CatalogAdmin } from '../../../domain/ports/in/CatalogAdmin';
import { ImageStore } from '../../../domain/ports/out/ImageStore';
import { AppConfig } from '../../../infrastructure/config';
import { registerPageRoutes } from './routes/pages';
import { registerMediaRoutes } from './routes/media';
import { registerAdminRoutes } from '../admin/routes';
import { baseViewModel } from './viewModel';
import { localeFromPath } from '../../../i18n/urls';

export interface ServerDeps {
  config: AppConfig;
  catalog: CatalogQueries;
  admin: CatalogAdmin;
  images: ImageStore;
}

/**
 * Builds (but does not start) the Fastify application: security headers, EJS
 * views, static assets, the public pages, the DB-backed /media route, and the
 * single-user dashboard. Kept separate from start-up for `app.inject(...)` tests.
 */
export async function buildServer({ config, catalog, admin, images }: ServerDeps): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.env !== 'test' ? { level: config.env === 'production' ? 'info' : 'debug' } : false,
    bodyLimit: 12 * 1024 * 1024, // headroom for image uploads
    // So '/en' and '/en/' both resolve to the locale's home page.
    ignoreTrailingSlash: true,
    // The app is only reachable via the edge proxy (ufw blocks 3000), so trust
    // X-Forwarded-* — gives real client IPs for the login rate limiter and logs.
    trustProxy: true,
  });

  // Content-Security-Policy: everything is same-origin (self-hosted fonts, CSS,
  // JS, images) except the optional Cloudflare Web Analytics beacon. No inline
  // scripts are used; inline styles are (hence 'unsafe-inline' for style only).
  const CSP = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "img-src 'self' data:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' https://static.cloudflareinsights.com",
    "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
  ].join('; ');

  // Sensible security headers. Frame options relaxed to SAMEORIGIN so the admin
  // image previews work; the dashboard is noindex.
  app.addHook('onSend', async (_req, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('X-DNS-Prefetch-Control', 'off');
    reply.header('Content-Security-Policy', CSP);
    if (config.env === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    return payload;
  });

  await app.register(fastifyView, {
    engine: { ejs },
    root: config.viewsDir,
    viewExt: 'ejs',
    defaultContext: { brandName: config.brand.name },
  });

  // Body parsers: urlencoded (login/delete forms) + multipart (image uploads).
  await app.register(fastifyCookie, { secret: config.admin.sessionSecret });
  await app.register(fastifyFormbody);
  await app.register(fastifyMultipart, {
    limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 20 },
  });

  await app.register(fastifyStatic, {
    root: path.resolve(config.publicDir),
    prefix: '/',
    index: false,
    cacheControl: config.env === 'production',
    maxAge: config.env === 'production' ? '7d' : 0,
  });

  await registerMediaRoutes(app, { images, config });
  await registerPageRoutes(app, { config, catalog });
  await registerAdminRoutes(app, { config, admin });

  app.setNotFoundHandler(async (req, reply) => {
    reply.code(404);
    // Keep the visitor in their language: read the locale from the URL prefix.
    const { locale } = localeFromPath(req.url);
    return reply.view('pages/not-found.ejs', {
      ...baseViewModel(config, 'home', new Date().getFullYear(), locale),
      requestedPath: req.url,
    });
  });

  return app;
}
