/**
 * The languages the site is published in. Turkish is the default (served at the
 * URL root, `/`); English and German live under `/en` and `/de`.
 *
 * This lives in the domain because product content itself is now multilingual:
 * a {@link Product} carries a name + description per locale.
 */
export const LOCALES = ['tr', 'en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

/** The language served at the URL root and used as the fallback for missing translations. */
export const DEFAULT_LOCALE: Locale = 'tr';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
