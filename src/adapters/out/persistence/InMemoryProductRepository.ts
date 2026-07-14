import { ProductRepository } from '../../../domain/ports/out/ProductRepository';
import { byOrder, Product } from '../../../domain/model/Product';
import { ProductCategory } from '../../../domain/model/ProductCategory';
import { CATALOG_SEED } from './catalog.seed';

/**
 * Driven (outbound) adapter: an in-memory implementation of
 * {@link ProductRepository}.
 *
 * This is deliberately the simplest thing that satisfies the port. When the
 * dashboard needs real persistence, add e.g. a PostgresProductRepository that
 * implements the same interface and swap it in the composition root
 * (src/infrastructure/container.ts) — nothing else changes.
 */
export class InMemoryProductRepository implements ProductRepository {
  private readonly items: Product[];

  constructor(seed: readonly Product[] = CATALOG_SEED) {
    // Copy so callers cannot mutate our internal store.
    this.items = seed.map((p) => ({ ...p }));
  }

  async findAll(): Promise<Product[]> {
    return [...this.items].sort(byOrder);
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    return this.items.filter((p) => p.category === category).sort(byOrder);
  }

  async findFeatured(limit?: number): Promise<Product[]> {
    const featured = this.items.filter((p) => p.featured).sort(byOrder);
    return typeof limit === 'number' ? featured.slice(0, limit) : featured;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.items.find((p) => p.slug === slug) ?? null;
  }
}
