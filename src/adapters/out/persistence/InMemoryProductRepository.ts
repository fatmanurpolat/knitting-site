import { randomUUID } from 'node:crypto';
import { ProductRepository } from '../../../domain/ports/out/ProductRepository';
import { byOrder, Product, ProductInput } from '../../../domain/model/Product';
import { DEFAULT_LOCALE } from '../../../domain/model/Locale';
import { ProductCategory } from '../../../domain/model/ProductCategory';
import { CATALOG_SEED } from './catalog.seed';

/**
 * In-memory {@link ProductRepository} — used when no DATABASE_URL is set
 * (local dev, static-site generation). Writes mutate the in-process array and
 * do not persist across restarts.
 */
export class InMemoryProductRepository implements ProductRepository {
  private readonly items: Product[];

  constructor(seed: readonly Product[] = CATALOG_SEED) {
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

  async findById(id: string): Promise<Product | null> {
    return this.items.find((p) => p.id === id) ?? null;
  }

  async create(input: ProductInput): Promise<Product> {
    const product = toProduct(randomUUID(), input);
    this.items.push(product);
    return product;
  }

  async update(id: string, input: ProductInput): Promise<Product | null> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updated = toProduct(id, input);
    this.items[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  async maxOrder(category: ProductCategory): Promise<number> {
    return this.items
      .filter((p) => p.category === category)
      .reduce((max, p) => Math.max(max, p.order), 0);
  }
}

function toProduct(id: string, input: ProductInput): Product {
  const base = input.translations[DEFAULT_LOCALE];
  return {
    id,
    slug: input.slug,
    category: input.category,
    name: base.name,
    description: base.description,
    translations: input.translations,
    priceCents: input.priceCents,
    currency: input.currency,
    imageId: input.imageId,
    image: input.imageId ? `/media/${input.imageId}` : '',
    etsyUrl: input.etsyUrl,
    instagramUrl: input.instagramUrl,
    featured: input.featured,
    order: input.order,
  };
}
