import { AppConfig } from '../../../infrastructure/config';

export type PageKey = 'home' | 'story' | 'dolls' | 'bags' | 'contact';

/**
 * Data every page shares — brand info, which nav link is active, and the
 * current year for the footer. Page handlers spread their own data on top.
 */
export interface BaseViewModel {
  brand: AppConfig['brand'];
  activePage: PageKey;
  year: number;
  nav: Array<{ key: PageKey; href: string; label: string }>;
}

const NAV: BaseViewModel['nav'] = [
  { key: 'home', href: '/', label: 'Anasayfa' },
  { key: 'story', href: '/story', label: 'Hikayemiz' },
  { key: 'dolls', href: '/dolls', label: 'Oyuncaklar' },
  { key: 'bags', href: '/bags', label: 'Çantalar' },
  { key: 'contact', href: '/contact', label: 'İletişim' },
];

export function baseViewModel(config: AppConfig, activePage: PageKey, year: number): BaseViewModel {
  return { brand: config.brand, activePage, year, nav: NAV };
}
