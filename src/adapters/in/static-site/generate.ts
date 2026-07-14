import path from 'node:path';
import fs from 'node:fs/promises';
import ejs from 'ejs';
import { loadConfig, AppConfig } from '../../../infrastructure/config';
import { buildContainer } from '../../../infrastructure/container';
import { CatalogQueries } from '../../../domain/ports/in/CatalogQueries';
import { baseViewModel, PageKey } from '../web/viewModel';

/**
 * Driving (inbound) adapter: a static-site generator.
 *
 * It reuses the EXACT same domain + application core as the Fastify server —
 * only the delivery mechanism differs. Each page is rendered to a plain .html
 * file and the /public assets are copied alongside, producing a fully static
 * site that can be hosted for free on Netlify or GitHub Pages (no server, no
 * running Node process, no cost beyond a domain name).
 *
 *   npm run generate        → writes ./dist-site
 *
 * Extensionless links (/story, /dolls, …) are served as story.html / dolls.html
 * automatically by both Netlify and GitHub Pages, so the same nav works whether
 * the site is served by this static output or by the dynamic Fastify server.
 */

interface PageSpec {
  out: string; // output filename, relative to the site root
  view: string; // EJS template, relative to viewsDir
  page: PageKey; // for nav highlighting
  data: () => Promise<Record<string, unknown>>; // page-specific view data
}

function pageSpecs(catalog: CatalogQueries): PageSpec[] {
  return [
    {
      out: 'index.html',
      view: 'pages/home.ejs',
      page: 'home',
      data: async () => {
        const [featured, dolls, bags] = await Promise.all([
          catalog.listFeatured(),
          catalog.listByCategory('doll'),
          catalog.listByCategory('bag'),
        ]);
        return { featured, gallery: [...dolls, ...bags] };
      },
    },
    { out: 'story.html', view: 'pages/story.ejs', page: 'story', data: async () => ({}) },
    {
      out: 'dolls.html',
      view: 'pages/dolls.ejs',
      page: 'dolls',
      data: async () => ({ products: await catalog.listByCategory('doll') }),
    },
    {
      out: 'bags.html',
      view: 'pages/bags.ejs',
      page: 'bags',
      data: async () => ({ products: await catalog.listByCategory('bag') }),
    },
    { out: 'contact.html', view: 'pages/contact.ejs', page: 'contact', data: async () => ({}) },
    {
      out: '404.html',
      view: 'pages/not-found.ejs',
      page: 'home',
      data: async () => ({ requestedPath: '' }),
    },
  ];
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else if (entry.isFile()) {
      await fs.copyFile(from, to);
    }
  }
}

/**
 * Optionally prefix all root-absolute URLs so the site can live under a
 * sub-path (e.g. GitHub Pages project sites: username.github.io/<repo>/).
 * Set BASE_PATH="/orgulog" for that case. Default is "" (root hosting).
 */
function applyBasePath(html: string, basePath: string): string {
  if (!basePath) return html;
  const clean = basePath.replace(/\/$/, '');
  // Rewrite href="/..." and src="/..." but leave protocol-relative (//) alone.
  return html.replace(/(href|src)="\/(?!\/)/g, `$1="${clean}/`);
}

async function generate(config: AppConfig, outDir: string): Promise<void> {
  const basePath = process.env.BASE_PATH ?? '';
  const container = buildContainer(config);
  const specs = pageSpecs(container.catalog);
  const year = new Date().getFullYear();

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  // 1. render every page
  for (const spec of specs) {
    const templatePath = path.join(config.viewsDir, spec.view);
    const data = { ...baseViewModel(config, spec.page, year), ...(await spec.data()) };
    const html = applyBasePath(await ejs.renderFile(templatePath, data), basePath);
    await fs.writeFile(path.join(outDir, spec.out), html, 'utf8');
    console.log(`  ✓ ${spec.out}`);
  }

  // 2. copy static assets (css/js/images) to the site root
  await copyDir(config.publicDir, outDir);
  console.log('  ✓ public/ assets');

  // 3. GitHub Pages: skip Jekyll processing so files like _redirects survive
  await fs.writeFile(path.join(outDir, '.nojekyll'), '', 'utf8');

  console.log(`\nStatic site written to ${outDir}${basePath ? ` (base "${basePath}")` : ''}`);
}

async function main(): Promise<void> {
  const config = loadConfig();
  const outDir = path.resolve(process.cwd(), process.env.SITE_OUT ?? 'dist-site');
  console.log('Generating static site…');
  await generate(config, outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
