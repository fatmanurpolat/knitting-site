import { FastifyInstance } from 'fastify';
import { CatalogQueries } from '../../../../domain/ports/in/CatalogQueries';
import { AppConfig } from '../../../../infrastructure/config';
import { baseViewModel, PageKey } from '../viewModel';

interface PageRouteDeps {
  config: AppConfig;
  catalog: CatalogQueries;
}

/**
 * Driving (inbound) adapter: the five portfolio pages.
 *
 * Handlers are thin — they call the inbound {@link CatalogQueries} port and
 * hand the result to a template. No business logic lives here.
 */
export async function registerPageRoutes(
  app: FastifyInstance,
  { config, catalog }: PageRouteDeps,
): Promise<void> {
  const base = (page: PageKey) => baseViewModel(config, page, new Date().getFullYear());

  app.get('/', async (_req, reply) => {
    const [featured, dolls, bags] = await Promise.all([
      catalog.listFeatured(),
      catalog.listByCategory('doll'),
      catalog.listByCategory('bag'),
    ]);
    return reply.view('pages/home.ejs', { ...base('home'), featured, gallery: [...dolls, ...bags] });
  });

  app.get('/story', async (_req, reply) => {
    return reply.view('pages/story.ejs', { ...base('story') });
  });

  app.get('/dolls', async (_req, reply) => {
    const dolls = await catalog.listByCategory('doll');
    return reply.view('pages/dolls.ejs', { ...base('dolls'), products: dolls });
  });

  app.get('/bags', async (_req, reply) => {
    const bags = await catalog.listByCategory('bag');
    return reply.view('pages/bags.ejs', { ...base('bags'), products: bags });
  });

  app.get('/contact', async (_req, reply) => {
    return reply.view('pages/contact.ejs', { ...base('contact') });
  });

  // Lightweight health check for load balancers / Ansible smoke tests.
  app.get('/healthz', async () => ({ status: 'ok' }));
}
