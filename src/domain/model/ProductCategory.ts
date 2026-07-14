/**
 * The two things Örgülog makes. Kept as a small closed union so the domain
 * (and later the dashboard) can reason about categories without magic strings.
 */
export const PRODUCT_CATEGORIES = ['doll', 'bag'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
