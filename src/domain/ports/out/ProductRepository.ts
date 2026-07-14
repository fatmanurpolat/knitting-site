import { Product } from '../../model/Product';
import { ProductCategory } from '../../model/ProductCategory';

/**
 * Driven (outbound) port.
 *
 * The application core depends on this interface, never on a concrete data
 * source. Today it is backed by an in-memory seed; tomorrow it can be a
 * Postgres/Redis adapter (like the Klip stack) with zero changes to the
 * domain or use cases.
 */
export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findByCategory(category: ProductCategory): Promise<Product[]>;
  findFeatured(limit?: number): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
}
