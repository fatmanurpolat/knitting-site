import { Pool, PoolClient } from 'pg';
import { ProductRepository } from '../../../domain/ports/out/ProductRepository';
import { Product, ProductInput } from '../../../domain/model/Product';
import { ProductCategory } from '../../../domain/model/ProductCategory';
import { LOCALES, DEFAULT_LOCALE } from '../../../domain/model/Locale';

interface Row {
  id: string;
  slug: string;
  category: ProductCategory;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_id: string | null;
  etsy_url: string;
  instagram_url: string;
  featured: boolean;
  sort_order: number;
  /** jsonb: { en?: {name,description}, de?: {name,description} } — Turkish lives in name/description. */
  translations: Record<string, { name?: string; description?: string }> | null;
}

// Turkish is the canonical copy in products.{name,description}; the other
// languages come from product_translations, folded into a jsonb map per row.
const BASE_SELECT = `
  SELECT p.id, p.slug, p.category, p.name, p.description, p.price_cents, p.currency,
         p.image_id, p.etsy_url, p.instagram_url, p.featured, p.sort_order,
         COALESCE(
           jsonb_object_agg(t.locale, jsonb_build_object('name', t.name, 'description', t.description))
             FILTER (WHERE t.locale IS NOT NULL),
           '{}'::jsonb
         ) AS translations
  FROM products p
  LEFT JOIN product_translations t ON t.product_id = p.id
`;

function toProduct(r: Row): Product {
  const extra = r.translations ?? {};
  const translations = {
    tr: { name: r.name, description: r.description },
    en: { name: extra.en?.name ?? '', description: extra.en?.description ?? '' },
    de: { name: extra.de?.name ?? '', description: extra.de?.description ?? '' },
  };
  return {
    id: r.id,
    slug: r.slug,
    category: r.category,
    name: r.name,
    description: r.description,
    translations,
    priceCents: r.price_cents,
    currency: r.currency,
    imageId: r.image_id,
    image: r.image_id ? `/media/${r.image_id}` : '',
    etsyUrl: r.etsy_url,
    instagramUrl: r.instagram_url,
    featured: r.featured,
    order: r.sort_order,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Upsert the non-default-language rows for a product (Turkish stays on products). */
async function upsertTranslations(
  client: PoolClient,
  productId: string,
  input: ProductInput,
): Promise<void> {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const { name, description } = input.translations[locale];
    await client.query(
      `INSERT INTO product_translations (product_id, locale, name, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, locale)
       DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [productId, locale, name, description],
    );
  }
}

/** Postgres-backed {@link ProductRepository}. */
export class PostgresProductRepository implements ProductRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Product[]> {
    const { rows } = await this.pool.query<Row>(
      `${BASE_SELECT} GROUP BY p.id ORDER BY p.category, p.sort_order, p.name`,
    );
    return rows.map(toProduct);
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    const { rows } = await this.pool.query<Row>(
      `${BASE_SELECT} WHERE p.category = $1 GROUP BY p.id ORDER BY p.sort_order, p.name`,
      [category],
    );
    return rows.map(toProduct);
  }

  async findFeatured(limit?: number): Promise<Product[]> {
    const { rows } = await this.pool.query<Row>(
      `${BASE_SELECT} WHERE p.featured GROUP BY p.id ORDER BY p.sort_order, p.name${limit ? ' LIMIT $1' : ''}`,
      limit ? [limit] : [],
    );
    return rows.map(toProduct);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { rows } = await this.pool.query<Row>(
      `${BASE_SELECT} WHERE p.slug = $1 GROUP BY p.id`,
      [slug],
    );
    return rows[0] ? toProduct(rows[0]) : null;
  }

  async findById(id: string): Promise<Product | null> {
    if (!UUID_RE.test(id)) return null;
    const { rows } = await this.pool.query<Row>(`${BASE_SELECT} WHERE p.id = $1 GROUP BY p.id`, [id]);
    return rows[0] ? toProduct(rows[0]) : null;
  }

  async create(input: ProductInput): Promise<Product> {
    const tr = input.translations[DEFAULT_LOCALE];
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO products (slug, category, name, description, price_cents, currency, image_id, etsy_url, instagram_url, featured, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [input.slug, input.category, tr.name, tr.description, input.priceCents, input.currency,
         input.imageId, input.etsyUrl, input.instagramUrl, input.featured, input.order],
      );
      const id = rows[0]!.id;
      await upsertTranslations(client, id, input);
      await client.query('COMMIT');
      return (await this.findById(id))!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: string, input: ProductInput): Promise<Product | null> {
    if (!UUID_RE.test(id)) return null;
    const tr = input.translations[DEFAULT_LOCALE];
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `UPDATE products SET
           slug=$2, category=$3, name=$4, description=$5, price_cents=$6, currency=$7,
           image_id=$8, etsy_url=$9, instagram_url=$10, featured=$11, sort_order=$12, updated_at=now()
         WHERE id=$1`,
        [id, input.slug, input.category, tr.name, tr.description, input.priceCents, input.currency,
         input.imageId, input.etsyUrl, input.instagramUrl, input.featured, input.order],
      );
      if ((res.rowCount ?? 0) === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      await upsertTranslations(client, id, input);
      await client.query('COMMIT');
      return this.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!UUID_RE.test(id)) return false;
    // product_translations rows cascade via ON DELETE CASCADE.
    const res = await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async maxOrder(category: ProductCategory): Promise<number> {
    const { rows } = await this.pool.query<{ max: number }>(
      'SELECT COALESCE(MAX(sort_order), 0)::int AS max FROM products WHERE category = $1',
      [category],
    );
    return rows[0]?.max ?? 0;
  }
}
