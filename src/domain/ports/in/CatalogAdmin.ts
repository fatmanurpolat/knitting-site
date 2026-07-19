import { Product, ProductInput } from '../../model/Product';

/**
 * Driving (inbound) port for the dashboard — the write side of the catalog.
 *
 * The public site uses {@link ../in/CatalogQueries.CatalogQueries} (reads); the
 * admin adapter uses this. Both are implemented by application services over
 * the same repository, so the public site is untouched by the dashboard.
 */
export interface CatalogAdmin {
  /** Every product (both categories), ordered — for the dashboard table. */
  listAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, input: ProductInput): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  /** Store an uploaded image, returning its id (for ProductInput.imageId). */
  uploadImage(bytes: Buffer, contentType: string): Promise<string>;
  /** Next order value to append a new product within its category. */
  nextOrder(category: Product['category']): Promise<number>;
}
