import { Product } from '../../model/Product';
import { ProductCategory } from '../../model/ProductCategory';
import { Locale } from '../../model/Locale';

/**
 * Driving (inbound) port.
 *
 * This is the API the outside world (the web adapter, the static generator)
 * uses to talk to the application core. Controllers depend on this interface,
 * not on the concrete service implementation.
 *
 * Every read takes a {@link Locale}: the returned products have their
 * `name`/`description` resolved to that language (falling back to Turkish).
 */
export interface CatalogQueries {
  /** Pieces highlighted on the home page. */
  listFeatured(locale: Locale, limit?: number): Promise<Product[]>;
  /** All pieces in a category (dolls or bags), ready to render. */
  listByCategory(category: ProductCategory, locale: Locale): Promise<Product[]>;
  /** A single piece by its slug, or null if it does not exist. */
  getBySlug(slug: string, locale: Locale): Promise<Product | null>;
}
