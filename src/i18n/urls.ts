import { DEFAULT_LOCALE, isLocale, Locale } from '../domain/model/Locale';
import { ProductCategory } from '../domain/model/ProductCategory';

/**
 * URL structure for the three languages. Turkish (the default) has no prefix;
 * the others are served under `/en` and `/de`:
 *
 *   tr → /           /story        /dolls
 *   en → /en/        /en/story     /en/dolls
 *   de → /de/        /de/story     /de/dolls
 *
 * These are pure helpers shared by the Fastify server, the static generator and
 * the view model, so links come out identical whichever adapter renders them.
 */

/** '' for the default locale, '/en' or '/de' otherwise. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/**
 * Prefix a root-absolute app path with the locale.
 *   localizeHref('en', '/dolls') → '/en/dolls'
 *   localizeHref('en', '/')      → '/en/'
 *   localizeHref('tr', '/dolls') → '/dolls'
 */
export function localizeHref(locale: Locale, path: string): string {
  const prefix = localePrefix(locale);
  if (!prefix) return path;
  return path === '/' ? `${prefix}/` : `${prefix}${path}`;
}

/**
 * The category page a product lives under: dolls or bags. Its detail page hangs
 * off that segment, e.g. a doll with slug "maymun-momo" → /dolls/maymun-momo.
 */
export function categorySegment(category: ProductCategory): 'dolls' | 'bags' {
  return category === 'bag' ? 'bags' : 'dolls';
}

/** Default-locale path to a product's own page, e.g. '/dolls/maymun-momo'. */
export function productPath(category: ProductCategory, slug: string): string {
  return `/${categorySegment(category)}/${slug}`;
}

/**
 * Read the locale from the start of a request path, returning the locale and the
 * remaining default-locale path.
 *   '/en/story' → { locale: 'en', path: '/story' }
 *   '/de'       → { locale: 'de', path: '/' }
 *   '/story'    → { locale: 'tr', path: '/story' }
 */
export function localeFromPath(pathname: string): { locale: Locale; path: string } {
  const match = /^\/([^/?#]+)(.*)$/.exec(pathname);
  if (match && isLocale(match[1]!)) {
    const rest = match[2] || '/';
    return { locale: match[1] as Locale, path: rest.startsWith('/') ? rest : `/${rest}` };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' };
}
