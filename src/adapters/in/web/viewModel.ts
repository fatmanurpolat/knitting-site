import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { AppConfig } from '../../../infrastructure/config';
import { Locale, LOCALES } from '../../../domain/model/Locale';
import { getMessages, Messages } from '../../../i18n/messages';
import { localizeHref, productPath } from '../../../i18n/urls';
import { Product } from '../../../domain/model/Product';

export type PageKey = 'home' | 'story' | 'dolls' | 'bags' | 'contact';

/** Canonical (default-locale) path for each page — the switcher/nav localize it. */
const PAGE_PATH: Record<PageKey, string> = {
  home: '/',
  story: '/story',
  dolls: '/dolls',
  bags: '/bags',
  contact: '/contact',
};

const PAGE_ORDER: PageKey[] = ['home', 'story', 'dolls', 'bags', 'contact'];

/** BCP-47 locale for Intl price formatting. */
const PRICE_LOCALE: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US', de: 'de-DE' };

export interface NavItem {
  key: PageKey;
  href: string;
  label: string;
}

export interface LangLink {
  locale: Locale;
  href: string;
  label: string;
  active: boolean;
}

/**
 * Data every page shares — brand info, the active language + its messages, which
 * nav link is active, the year, and a price formatter. Page handlers spread their
 * own data on top. Because EJS includes inherit the parent scope, partials
 * (nav/footer/product-card) can use all of these without them being re-passed.
 */
export interface BaseViewModel {
  brand: AppConfig['brand'];
  locale: Locale;
  /** Localized UI copy for the current language. */
  t: Messages;
  activePage: PageKey;
  year: number;
  nav: NavItem[];
  /** TR/EN/DE switcher pointing at the current page in each language. */
  langLinks: LangLink[];
  /** Prefix a root-absolute app path with the current locale, e.g. '/dolls' → '/en/dolls'. */
  href: (path: string) => string;
  formatPrice: (cents: number, currency: string) => string;
  /** Content hash of styles.css for cache-busting the stylesheet link. */
  assetVersion: string;
  /** Cloudflare Web Analytics beacon token ('' ⇒ no analytics script). */
  analyticsToken: string;
}

/**
 * Short content hash of the main stylesheet, appended to its URL as `?v=…` so a
 * deploy's CSS changes bypass the browser cache (assets are served with a long
 * max-age). Computed once per process — the app restarts on deploy, and the
 * static generator runs once, so the value is always fresh for the current CSS.
 */
let cachedAssetVersion: string | undefined;
export function assetVersion(publicDir: string): string {
  if (cachedAssetVersion !== undefined) return cachedAssetVersion;
  try {
    const css = readFileSync(path.join(publicDir, 'css', 'styles.css'));
    cachedAssetVersion = createHash('sha1').update(css).digest('hex').slice(0, 8);
  } catch {
    cachedAssetVersion = '0';
  }
  return cachedAssetVersion;
}

/** A locale-aware price formatter. Currency (usually TRY) is unchanged. */
export function makeFormatPrice(locale: Locale): (cents: number, currency: string) => string {
  const intlLocale = PRICE_LOCALE[locale];
  return (cents: number, currency: string): string => {
    try {
      return new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency: currency || 'TRY',
      }).format((cents || 0) / 100);
    } catch {
      return `${((cents || 0) / 100).toFixed(2)} ${currency || 'TRY'}`;
    }
  };
}

/** Turkish price formatter, kept for the (Turkish-only) admin dashboard. */
export const formatPrice = makeFormatPrice('tr');

/** Placeholder values the seed uses for "not set" — treated as absent. */
const NOT_LISTED = new Set(['', '#etsy-link']);
const NO_INSTAGRAM = new Set(['', '#instagram-dm']);
const NO_WHATSAPP = new Set(['', '#whatsapp']);

/** The order/contact links shown on a product's page, resolved for that piece. */
export interface OrderLinks {
  /** External shop listing (Etsy/Amazon/…) when the piece is listed, else null. */
  shop: { href: string; label: string } | null;
  /** wa.me link carrying a prefilled, piece-specific message — null if WhatsApp is off. */
  whatsapp: string | null;
  /** Instagram link: the piece's own post if it has one, otherwise the brand profile. */
  instagram: string;
}

/**
 * Build the order links for a single product. Shared by the Fastify server and
 * the static generator so both emit identical URLs. `productUrl` is the piece's
 * absolute page URL; when provided it's appended to the WhatsApp message so the
 * maker sees exactly which piece is meant (omitted when the site origin is
 * unknown — the message still names the piece).
 */
export function buildOrderLinks(
  product: Product,
  brand: AppConfig['brand'],
  t: Messages,
  productUrl = '',
): OrderLinks {
  const shop = !NOT_LISTED.has(product.etsyUrl)
    ? {
        href: product.etsyUrl,
        label: /amazon\./i.test(product.etsyUrl)
          ? t.card.shopAmazon
          : /etsy\./i.test(product.etsyUrl)
            ? t.card.shopEtsy
            : t.card.shopGeneric,
      }
    : null;

  const instagram = !NO_INSTAGRAM.has(product.instagramUrl)
    ? product.instagramUrl
    : brand.instagramUrl;

  let whatsapp: string | null = null;
  if (!NO_WHATSAPP.has(brand.whatsappUrl)) {
    // Replacement-function form so a '$' in the product name is not interpreted
    // as a special replacement pattern ($&, $', $$, …).
    const message =
      t.product.waMessage.replace('{product}', () => product.name) +
      (productUrl ? `\n${productUrl}` : '');
    const sep = brand.whatsappUrl.includes('?') ? '&' : '?';
    whatsapp = `${brand.whatsappUrl}${sep}text=${encodeURIComponent(message)}`;
  }

  return { shop, whatsapp, instagram };
}

/**
 * Everything the single-product template needs beyond the base view model:
 * the piece, its resolved order links, and product-specific meta/OG tags (so a
 * shared product link previews with its own title, description and photo). The
 * Fastify server and the static generator both call this, so a product page is
 * identical whichever renders it.
 */
export function productViewData(
  product: Product,
  config: AppConfig,
  locale: Locale,
  t: Messages,
): {
  product: Product;
  orderLinks: OrderLinks;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
} {
  const productUrl = config.siteUrl
    ? config.siteUrl + localizeHref(locale, productPath(product.category, product.slug))
    : '';
  const ogImage =
    config.siteUrl && product.image
      ? product.image.startsWith('http')
        ? product.image
        : config.siteUrl + product.image
      : '';
  return {
    product,
    orderLinks: buildOrderLinks(product, config.brand, t, productUrl),
    metaTitle: product.name,
    metaDescription: product.description,
    ogImage,
  };
}

export function baseViewModel(
  config: AppConfig,
  activePage: PageKey,
  year: number,
  locale: Locale,
): BaseViewModel {
  const t = getMessages(locale);
  const nav: NavItem[] = PAGE_ORDER.map((key) => ({
    key,
    href: localizeHref(locale, PAGE_PATH[key]),
    label: t.nav[key],
  }));
  const langLinks: LangLink[] = LOCALES.map((l) => ({
    locale: l,
    href: localizeHref(l, PAGE_PATH[activePage]),
    label: l.toUpperCase(),
    active: l === locale,
  }));
  return {
    brand: config.brand,
    locale,
    t,
    activePage,
    year,
    nav,
    langLinks,
    href: (path: string) => localizeHref(locale, path),
    formatPrice: makeFormatPrice(locale),
    assetVersion: assetVersion(config.publicDir),
    analyticsToken: config.analytics.cloudflareToken,
  };
}
