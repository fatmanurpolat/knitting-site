import { ProductCategory } from './ProductCategory';
import { DEFAULT_LOCALE, Locale, LOCALES } from './Locale';

/** A product's name + description in one language. */
export interface LocalizedText {
  readonly name: string;
  readonly description: string;
}

/**
 * A single handmade piece — a doll or a bag.
 *
 * The core domain entity: free of any framework, database, or HTTP concern, so
 * the same object is served by the public website, the static generator, and
 * edited by the dashboard.
 *
 * Content is multilingual: {@link translations} holds a name + description per
 * {@link Locale}. `name`/`description` are the *resolved* values for the locale
 * being rendered (default Turkish), so templates and the dashboard table can
 * keep reading them directly; call {@link localizeProduct} to switch language.
 */
export interface Product {
  readonly id: string;
  /** URL-friendly, human-readable key, e.g. "maymun-momo". */
  readonly slug: string;
  readonly category: ProductCategory;
  readonly name: string;
  readonly description: string;
  /** Name + description per language (Turkish always present; en/de may be blank). */
  readonly translations: Record<Locale, LocalizedText>;
  /** Price in minor units (kuruş for TRY). 0 means "not priced — ask". */
  readonly priceCents: number;
  /** ISO 4217 currency code, e.g. "TRY". */
  readonly currency: string;
  /** DB id of the photo (null = no image yet). */
  readonly imageId: string | null;
  /** Render URL for the photo: "/media/<imageId>" or a static path or "". */
  readonly image: string;
  /** Shop listing (Etsy/Amazon/…). "#etsy-link"/empty means "not listed yet". */
  readonly etsyUrl: string;
  /** Instagram post/profile/DM link for this piece. */
  readonly instagramUrl: string;
  /** Whether the piece is highlighted on the home page. */
  readonly featured: boolean;
  /** Ordering hint within its category (ascending). */
  readonly order: number;
}

/**
 * The editable fields of a product — what the dashboard sends to create or
 * update one. No id (assigned by the store) and no render URL (derived from
 * imageId). Carries the name + description in every language.
 */
export interface ProductInput {
  slug: string;
  category: ProductCategory;
  translations: Record<Locale, LocalizedText>;
  priceCents: number;
  currency: string;
  imageId: string | null;
  etsyUrl: string;
  instagramUrl: string;
  featured: boolean;
  order: number;
}

/**
 * Build a full per-locale record from partial input, trimming values and
 * guaranteeing every locale has an entry (blank where not provided).
 */
export function toTranslations(
  partial: Partial<Record<Locale, Partial<LocalizedText>>>,
): Record<Locale, LocalizedText> {
  const out = {} as Record<Locale, LocalizedText>;
  for (const locale of LOCALES) {
    out[locale] = {
      name: (partial[locale]?.name ?? '').trim(),
      description: (partial[locale]?.description ?? '').trim(),
    };
  }
  return out;
}

/**
 * Resolve a product's `name`/`description` to a locale, falling back to the
 * default language (Turkish) when a translation is blank. Pure — returns a copy.
 */
export function localizeProduct(product: Product, locale: Locale): Product {
  const wanted = product.translations[locale];
  const fallback = product.translations[DEFAULT_LOCALE];
  const name = wanted?.name?.trim() ? wanted.name : fallback?.name ?? product.name;
  const description = wanted?.description?.trim()
    ? wanted.description
    : fallback?.description ?? product.description;
  return { ...product, name, description };
}

export function isFeatured(product: Product): boolean {
  return product.featured;
}

export function byOrder(a: Product, b: Product): number {
  return a.order - b.order;
}

/** Turn a name into a URL-safe slug (Turkish characters folded to ASCII). */
export function slugify(value: string): string {
  const map: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return value
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'urun';
}
