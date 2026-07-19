import { AppConfig } from '../../../infrastructure/config';
import { Locale, LOCALES } from '../../../domain/model/Locale';
import { getMessages, Messages } from '../../../i18n/messages';
import { localizeHref } from '../../../i18n/urls';

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
  };
}
