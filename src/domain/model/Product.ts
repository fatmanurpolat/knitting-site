import { ProductCategory } from './ProductCategory';

/**
 * A single handmade piece — a doll or a bag.
 *
 * This is the core domain entity. It is intentionally free of any framework,
 * database, or HTTP concern so the same object can be served by the website
 * today and edited by the dashboard later.
 */
export interface Product {
  /** Stable identifier (used by the future dashboard for edits/deletes). */
  readonly id: string;
  /** URL-friendly, human-readable key, e.g. "lavender-bunny". */
  readonly slug: string;
  readonly category: ProductCategory;
  readonly name: string;
  /** Short story/description shown under the piece. */
  readonly description: string;
  /** Path or URL to the photo, e.g. "/images/doll-photo-1.jpg.svg". */
  readonly image: string;
  /** Shop listing (Etsy/Amazon/…). Empty string means "not listed yet". */
  readonly etsyUrl: string;
  /** Instagram post/profile/DM link for this piece. */
  readonly instagramUrl: string;
  /** Whether the piece is highlighted on the home page. */
  readonly featured: boolean;
  /** Ordering hint within its category (ascending). */
  readonly order: number;
}

export function isFeatured(product: Product): boolean {
  return product.featured;
}

export function byOrder(a: Product, b: Product): number {
  return a.order - b.order;
}
