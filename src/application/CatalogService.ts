import { CatalogQueries } from '../domain/ports/in/CatalogQueries';
import { ProductRepository } from '../domain/ports/out/ProductRepository';
import { byOrder, localizeProduct, Product } from '../domain/model/Product';
import { ProductCategory } from '../domain/model/ProductCategory';
import { Locale } from '../domain/model/Locale';

/**
 * The application core — the single implementation of the inbound
 * {@link CatalogQueries} port. It orchestrates the domain and delegates all
 * storage to the outbound {@link ProductRepository} port.
 *
 * No Fastify, no EJS, no SQL in here on purpose: this is the part that stays
 * stable while adapters come and go.
 */
export class CatalogService implements CatalogQueries {
  private static readonly DEFAULT_FEATURED_LIMIT = 3;

  constructor(private readonly products: ProductRepository) {}

  async listFeatured(
    locale: Locale,
    limit: number = CatalogService.DEFAULT_FEATURED_LIMIT,
  ): Promise<Product[]> {
    const featured = await this.products.findFeatured(limit);
    return [...featured].sort(byOrder).slice(0, limit).map((p) => localizeProduct(p, locale));
  }

  async listByCategory(category: ProductCategory, locale: Locale): Promise<Product[]> {
    const items = await this.products.findByCategory(category);
    return [...items].sort(byOrder).map((p) => localizeProduct(p, locale));
  }

  async getBySlug(slug: string, locale: Locale): Promise<Product | null> {
    const product = await this.products.findBySlug(slug);
    return product ? localizeProduct(product, locale) : null;
  }
}
