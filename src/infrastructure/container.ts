import type { Pool } from 'pg';
import { CatalogService } from '../application/CatalogService';
import { AdminService } from '../application/AdminService';
import { CatalogQueries } from '../domain/ports/in/CatalogQueries';
import { CatalogAdmin } from '../domain/ports/in/CatalogAdmin';
import { ImageStore } from '../domain/ports/out/ImageStore';
import { ProductRepository } from '../domain/ports/out/ProductRepository';
import { InMemoryProductRepository } from '../adapters/out/persistence/InMemoryProductRepository';
import { InMemoryImageStore } from '../adapters/out/persistence/InMemoryImageStore';
import { AppConfig } from './config';

/**
 * Composition root — the ONE place where concrete implementations are wired to
 * ports. With a DATABASE_URL it uses Postgres (products + images in the DB) and
 * runs migrations/seed; without one it falls back to the in-memory seed so the
 * site and the static generator still run with zero setup.
 */
export interface Container {
  readonly catalog: CatalogQueries;
  readonly admin: CatalogAdmin;
  readonly images: ImageStore;
  readonly usingDatabase: boolean;
  close(): Promise<void>;
}

export async function buildContainer(config: AppConfig): Promise<Container> {
  let productRepository: ProductRepository;
  let imageStore: ImageStore;
  let pool: Pool | null = null;

  if (config.database.url) {
    // Lazy-load pg only when a database is configured.
    const { createPool, waitForDb, migrate, seedIfEmpty, seedTranslationsIfEmpty } = await import(
      '../adapters/out/persistence/db'
    );
    const { PostgresProductRepository } = await import(
      '../adapters/out/persistence/PostgresProductRepository'
    );
    const { PostgresImageStore } = await import('../adapters/out/persistence/PostgresImageStore');

    pool = createPool(config.database.url);
    await waitForDb(pool);
    await migrate(pool);
    const seeded = await seedIfEmpty(pool, config.publicDir);
    if (seeded > 0) console.log(`[db] seeded ${seeded} products (+images) into the database`);
    // Add EN/DE copy for the starter catalog (idempotent; never overwrites edits).
    const translated = await seedTranslationsIfEmpty(pool);
    if (translated > 0) console.log(`[db] added ${translated} product translations (en/de)`);

    productRepository = new PostgresProductRepository(pool);
    imageStore = new PostgresImageStore(pool);
  } else {
    productRepository = new InMemoryProductRepository();
    imageStore = new InMemoryImageStore();
  }

  const catalog = new CatalogService(productRepository);
  const admin = new AdminService(productRepository, imageStore);

  return {
    catalog,
    admin,
    images: imageStore,
    usingDatabase: pool !== null,
    close: async () => {
      if (pool) await pool.end();
    },
  };
}
