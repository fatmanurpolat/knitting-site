import { CatalogAdmin } from '../domain/ports/in/CatalogAdmin';
import { ProductRepository } from '../domain/ports/out/ProductRepository';
import { ImageStore } from '../domain/ports/out/ImageStore';
import { Product, ProductInput } from '../domain/model/Product';
import { ProductCategory } from '../domain/model/ProductCategory';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

/**
 * Application core for the dashboard (write side). Implements {@link CatalogAdmin}
 * over the repository + image store. No HTTP, no SQL. HTTP form parsing lives in
 * the admin adapter, which hands validated {@link ProductInput}s to these methods.
 */
export class AdminService implements CatalogAdmin {
  constructor(
    private readonly products: ProductRepository,
    private readonly images: ImageStore,
  ) {}

  listAll(): Promise<Product[]> {
    return this.products.findAll();
  }

  getById(id: string): Promise<Product | null> {
    return this.products.findById(id);
  }

  nextOrder(category: ProductCategory): Promise<number> {
    return this.products.maxOrder(category).then((m) => m + 1);
  }

  createProduct(input: ProductInput): Promise<Product> {
    return this.products.create(input);
  }

  updateProduct(id: string, input: ProductInput): Promise<Product | null> {
    return this.products.update(id, input);
  }

  deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async uploadImage(bytes: Buffer, contentType: string): Promise<string> {
    const type = (contentType || '').split(';')[0]!.trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(type)) {
      throw new ValidationError(`Desteklenmeyen görsel türü: ${type || 'bilinmiyor'}`);
    }
    if (!bytes || bytes.length === 0) {
      throw new ValidationError('Boş dosya yüklenemez.');
    }
    return this.images.save(bytes, type);
  }
}

/** "250", "250,50", "1.250,00", "250.50" → integer cents. Blank → 0. Pure. */
export function parsePriceToCents(raw: string | undefined): number {
  const s = (raw ?? '').trim();
  if (!s) return 0;
  let normalized = s.replace(/[^\d.,]/g, '');
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.'); // "1.250,50" → "1250.50"
  }
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError('Fiyat geçersiz.');
  }
  return Math.round(value * 100);
}
