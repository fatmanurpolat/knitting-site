import { FastifyInstance } from 'fastify';
import { CatalogQueries } from '../../../../domain/ports/in/CatalogQueries';
import { AppConfig } from '../../../../infrastructure/config';
import { Locale, LOCALES } from '../../../../domain/model/Locale';
import { localePrefix } from '../../../../i18n/urls';
import { baseViewModel, PageKey } from '../viewModel';

interface PageRouteDeps {
  config: AppConfig;
  catalog: CatalogQueries;
}

/**
 * Driving (inbound) adapter: the five portfolio pages, registered once per
 * language. Turkish is served at the root; English and German under /en and /de
 * (see {@link localePrefix}). Handlers are thin — they call the inbound
 * {@link CatalogQueries} port with the request's locale and hand the localized
 * result to a template.
 */
function registerLocalizedPages(
  app: FastifyInstance,
  { config, catalog, locale }: PageRouteDeps & { locale: Locale },
): void {
  const base = (page: PageKey) => baseViewModel(config, page, new Date().getFullYear(), locale);

  app.get('/', async (_req, reply) => {
    const [featured, dolls, bags] = await Promise.all([
      catalog.listFeatured(locale),
      catalog.listByCategory('doll', locale),
      catalog.listByCategory('bag', locale),
    ]);
    return reply.view('pages/home.ejs', { ...base('home'), featured, gallery: [...dolls, ...bags] });
  });

  app.get('/story', async (_req, reply) => {
    return reply.view('pages/story.ejs', { ...base('story') });
  });

  app.get('/dolls', async (_req, reply) => {
    const dolls = await catalog.listByCategory('doll', locale);
    return reply.view('pages/dolls.ejs', { ...base('dolls'), products: dolls });
  });

  app.get('/bags', async (_req, reply) => {
    const bags = await catalog.listByCategory('bag', locale);
    return reply.view('pages/bags.ejs', { ...base('bags'), products: bags });
  });

  app.get('/contact', async (_req, reply) => {
    return reply.view('pages/contact.ejs', { ...base('contact') });
  });
}

export async function registerPageRoutes(
  app: FastifyInstance,
  { config, catalog }: PageRouteDeps,
): Promise<void> {
  for (const locale of LOCALES) {
    const prefix = localePrefix(locale);
    await app.register(
      async (scope) => {
        registerLocalizedPages(scope, { config, catalog, locale });
      },
      prefix ? { prefix } : {},
    );
  }

  // Lightweight health check for load balancers / Ansible smoke tests (locale-free).
  app.get('/healthz', async () => ({ status: 'ok' }));
}
