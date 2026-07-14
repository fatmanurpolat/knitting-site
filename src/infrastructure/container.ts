import { CatalogService } from '../application/CatalogService';
import { CatalogQueries } from '../domain/ports/in/CatalogQueries';
import { InMemoryProductRepository } from '../adapters/out/persistence/InMemoryProductRepository';
import { AppConfig } from './config';

/**
 * Composition root — the ONE place where concrete implementations are wired
 * to ports. This is where hexagonal architecture pays off: to move from the
 * in-memory seed to a real database, change only this file.
 *
 *   e.g.  const repo = new PostgresProductRepository(pool);
 */
export interface Container {
  readonly catalog: CatalogQueries;
}

export function buildContainer(_config: AppConfig): Container {
  // ── outbound adapters (driven) ──────────────────────────────────────────
  const productRepository = new InMemoryProductRepository();

  // ── application core ────────────────────────────────────────────────────
  const catalog = new CatalogService(productRepository);

  return { catalog };
}
