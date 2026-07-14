import { Product } from '../../model/Product';
import { ProductCategory } from '../../model/ProductCategory';

/**
 * Driving (inbound) port.
 *
 * This is the API the outside world (the web adapter now, the dashboard
 * later) uses to talk to the application core. Controllers depend on this
 * interface, not on the concrete service implementation.
 */
export interface CatalogQueries {
  /** Pieces highlighted on the home page. */
  listFeatured(limit?: number): Promise<Product[]>;
  /** All pieces in a category (dolls or bags), ready to render. */
  listByCategory(category: ProductCategory): Promise<Product[]>;
  /** A single piece by its slug, or null if it does not exist. */
  getBySlug(slug: string): Promise<Product | null>;
}
