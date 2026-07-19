import path from 'node:path';

/**
 * All runtime configuration in one place, read from the environment with safe
 * defaults for local development. Adapters receive this object; nobody reads
 * process.env directly elsewhere.
 */
export interface AppConfig {
  readonly env: 'development' | 'production' | 'test';
  readonly host: string;
  readonly port: number;
  /** Absolute path to the EJS templates directory. */
  readonly viewsDir: string;
  /** Absolute path to the static assets directory (css/js/images). */
  readonly publicDir: string;
  /** Brand identity surfaced to every template. */
  readonly brand: BrandConfig;
  /** Database. If `url` is unset the app falls back to the in-memory seed. */
  readonly database: { readonly url?: string };
  /** Single-user dashboard credentials + cookie signing secret. */
  readonly admin: AdminConfig;
}

export interface AdminConfig {
  readonly user: string;
  /** Empty password ⇒ dashboard login is disabled. */
  readonly password: string;
  readonly sessionSecret: string;
}

export interface BrandConfig {
  readonly name: string;
  readonly tagline: string;
  readonly instagramUrl: string;
  /** wa.me/<number> link (or full URL). Empty/placeholder hides WhatsApp CTAs. */
  readonly whatsappUrl: string;
  readonly email: string;
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asEnv(value: string | undefined): AppConfig['env'] {
  return value === 'production' || value === 'test' ? value : 'development';
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  // Project root = one level up from this file's directory at runtime.
  // dev (tsx): <root>/src/infrastructure -> <root>
  // prod (node): <root>/dist/infrastructure -> <root>
  const projectRoot = path.resolve(__dirname, '..', '..');

  return {
    env: asEnv(env.NODE_ENV),
    host: env.HOST ?? '0.0.0.0',
    port: toInt(env.PORT, 3000),
    viewsDir: env.VIEWS_DIR ?? path.join(projectRoot, 'views'),
    publicDir: env.PUBLIC_DIR ?? path.join(projectRoot, 'public'),
    brand: {
      // REPLACE: brand basics (also settable via env for the future dashboard).
      name: env.BRAND_NAME ?? 'Örgülog',
      tagline: env.BRAND_TAGLINE ?? 'İplikle, sabırla ve sevgiyle; tek tek elde örülüyor.',
      instagramUrl: env.BRAND_INSTAGRAM ?? 'https://www.instagram.com/orgulog2/',
      // wa.me/<ülke kodu + numara>, +/boşluk olmadan → +90 538 727 71 85
      whatsappUrl: env.BRAND_WHATSAPP ?? 'https://wa.me/905387277185',
      email: env.BRAND_EMAIL ?? 'hello@orgulog.example',
    },
    database: { url: env.DATABASE_URL },
    admin: {
      user: env.ADMIN_USER ?? 'admin',
      password: env.ADMIN_PASSWORD ?? '',
      sessionSecret: env.SESSION_SECRET ?? 'dev-insecure-secret-change-me-please-32+',
    },
  };
}
