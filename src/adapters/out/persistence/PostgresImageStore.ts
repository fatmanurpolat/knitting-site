import { Pool } from 'pg';
import { ImageStore, StoredImage } from '../../../domain/ports/out/ImageStore';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres-backed {@link ImageStore} — image bytes live in a `bytea` column. */
export class PostgresImageStore implements ImageStore {
  constructor(private readonly pool: Pool) {}

  async save(bytes: Buffer, contentType: string): Promise<string> {
    const { rows } = await this.pool.query<{ id: string }>(
      'INSERT INTO images (content_type, bytes) VALUES ($1, $2) RETURNING id',
      [contentType, bytes],
    );
    return rows[0]!.id;
  }

  async get(id: string): Promise<StoredImage | null> {
    if (!UUID_RE.test(id)) return null;
    const { rows } = await this.pool.query<{ content_type: string; bytes: Buffer }>(
      'SELECT content_type, bytes FROM images WHERE id = $1',
      [id],
    );
    if (!rows[0]) return null;
    return { contentType: rows[0].content_type, bytes: rows[0].bytes };
  }

  async delete(id: string): Promise<void> {
    if (!UUID_RE.test(id)) return;
    await this.pool.query('DELETE FROM images WHERE id = $1', [id]);
  }
}
