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

// Detect the real image type from the file's magic bytes — never trust the
// client-supplied MIME string. SVG is intentionally NOT supported: served as
// image/svg+xml it can execute embedded script (stored XSS). Raster only.
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

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

  async updateProduct(id: string, input: ProductInput): Promise<Product | null> {
    const existing = await this.products.findById(id);
    const updated = await this.products.update(id, input);
    // A replaced photo leaves the previous image row orphaned — delete it.
    if (updated && existing?.imageId && existing.imageId !== input.imageId) {
      await this.images.delete(existing.imageId);
    }
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const existing = await this.products.findById(id);
    const ok = await this.products.delete(id);
    if (ok && existing?.imageId) await this.images.delete(existing.imageId);
    return ok;
  }

  async uploadImage(bytes: Buffer, _clientType: string): Promise<string> {
    if (!bytes || bytes.length === 0) {
      throw new ValidationError('Boş dosya yüklenemez.');
    }
    // Trust the bytes, not the client's Content-Type header.
    const type = sniffImageType(bytes);
    if (!type) {
      throw new ValidationError('Desteklenmeyen veya bozuk görsel. JPEG, PNG, WebP ya da GIF yükleyin.');
    }
    return this.images.save(bytes, type);
  }
}

/** "250", "250,50", "1.250,00", "1.250", "250.50" → integer cents. Blank → 0. Pure. */
export function parsePriceToCents(raw: string | undefined): number {
  const s = (raw ?? '').trim();
  if (!s) return 0;
  const cleaned = s.replace(/[^\d.,]/g, '');
  let normalized: string;
  if (cleaned.includes(',')) {
    // Turkish/European: comma is the decimal separator, dots are grouping.
    normalized = cleaned.replace(/\./g, '').replace(/,/g, '.');
    if ((normalized.match(/\./g) ?? []).length > 1) throw new ValidationError('Fiyat geçersiz.');
  } else if (cleaned.includes('.')) {
    const dots = (cleaned.match(/\./g) ?? []).length;
    const tail = cleaned.slice(cleaned.lastIndexOf('.') + 1);
    // A single dot with a 3-digit tail is Turkish thousands grouping ("1.250" =
    // 1250); otherwise a lone dot is a decimal point ("250.50"). Multiple dots
    // are always grouping ("1.250.000").
    normalized = dots === 1 && tail.length !== 3 ? cleaned : cleaned.replace(/\./g, '');
  } else {
    normalized = cleaned;
  }
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new ValidationError('Fiyat geçersiz.');
  }
  return Math.round(value * 100);
}
