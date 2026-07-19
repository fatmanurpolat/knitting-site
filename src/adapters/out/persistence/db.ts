import path from 'node:path';
import fs from 'node:fs/promises';
import { Pool } from 'pg';
import { CATALOG_SEED_ENTRIES } from './catalog.seed';

export function createPool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl, max: 8 });
}

/** Wait for the database to accept connections (docker start-up race). */
export async function waitForDb(pool: Pool, attempts = 30, delayMs = 1000): Promise<void> {
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

const SCHEMA = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  bytes        bytea NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  category      text NOT NULL CHECK (category IN ('doll','bag')),
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  price_cents   integer NOT NULL DEFAULT 0,
  currency      text NOT NULL DEFAULT 'TRY',
  image_id      uuid REFERENCES images(id) ON DELETE SET NULL,
  etsy_url      text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  featured      boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_order_idx ON products (category, sort_order);

-- Non-default-language product copy. Turkish stays in products.{name,description};
-- English/German live here, one row per (product, locale).
CREATE TABLE IF NOT EXISTS product_translations (
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale      text NOT NULL CHECK (locale IN ('tr','en','de')),
  name        text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  PRIMARY KEY (product_id, locale)
);
`;

export async function migrate(pool: Pool): Promise<void> {
  await pool.query(SCHEMA);
}

/**
 * Fill in the English/German copy for the starter catalog, matching products by
 * slug. Uses ON CONFLICT DO NOTHING so it only ever *adds* missing translations
 * and never overwrites edits made in the dashboard — safe to run on every boot,
 * and it backfills databases that were seeded before translations existed.
 */
export async function seedTranslationsIfEmpty(pool: Pool): Promise<number> {
  let inserted = 0;
  for (const entry of CATALOG_SEED_ENTRIES) {
    for (const [locale, text] of Object.entries(entry.translations)) {
      if (!text.name && !text.description) continue;
      const res = await pool.query(
        `INSERT INTO product_translations (product_id, locale, name, description)
         SELECT id, $2, $3, $4 FROM products WHERE slug = $1
         ON CONFLICT (product_id, locale) DO NOTHING`,
        [entry.slug, locale, text.name, text.description],
      );
      inserted += res.rowCount ?? 0;
    }
  }
  return inserted;
}

function contentTypeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  return (
    { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }[
      ext
    ] ?? 'application/octet-stream'
  );
}

/**
 * First-run seed: if there are no products, insert the starter catalog and load
 * each product's photo from /public/images into the `images` table (bytea), so
 * that from then on all product images are served from the database.
 */
export async function seedIfEmpty(pool: Pool, publicDir: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM products');
  if (Number(rows[0]?.count ?? 0) > 0) return 0;

  let inserted = 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const entry of CATALOG_SEED_ENTRIES) {
      let imageId: string | null = null;
      try {
        const file = path.join(publicDir, entry.image.replace(/^\//, ''));
        const bytes = await fs.readFile(file);
        const res = await client.query<{ id: string }>(
          'INSERT INTO images (content_type, bytes) VALUES ($1, $2) RETURNING id',
          [contentTypeFor(file), bytes],
        );
        imageId = res.rows[0]!.id;
      } catch {
        imageId = null; // image file missing → product without photo
      }
      await client.query(
        `INSERT INTO products (slug, category, name, description, price_cents, currency, image_id, etsy_url, instagram_url, featured, sort_order)
         VALUES ($1,$2,$3,$4,0,'TRY',$5,'#etsy-link','#instagram-dm',$6,$7)
         ON CONFLICT (slug) DO NOTHING`,
        [entry.slug, entry.category, entry.name, entry.description, imageId, entry.featured, entry.order],
      );
      inserted++;
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return inserted;
}
