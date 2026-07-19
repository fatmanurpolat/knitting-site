import { Product, ProductInput } from '../../model/Product';
import { ProductCategory } from '../../model/ProductCategory';

/**
 * Driven (outbound) port for product storage.
 *
 * Reads are used by the public site; writes by the dashboard. The application
 * core depends on this interface, never on a concrete data source — today an
 * in-memory seed or Postgres, tomorrow anything else.
 */
export interface ProductRepository {
  // ── reads ────────────────────────────────────────────────────────────────
  findAll(): Promise<Product[]>;
  findByCategory(category: ProductCategory): Promise<Product[]>;
  findFeatured(limit?: number): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;

  // ── writes (dashboard) ─────────────────────────────────────────────────────
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  /** Highest existing order in a category (0 if none) — for appending. */
  maxOrder(category: ProductCategory): Promise<number>;
}
