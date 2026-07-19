/**
 * Driven (outbound) port for binary image storage.
 *
 * The requirement is that product images live in the database and are served
 * from it — so this is backed by a `bytea` column in Postgres. An in-memory
 * implementation exists for running without a database.
 */
export interface StoredImage {
  readonly contentType: string;
  readonly bytes: Buffer;
}

export interface ImageStore {
  /** Persist an image and return its id (used to build "/media/<id>"). */
  save(bytes: Buffer, contentType: string): Promise<string>;
  /** Fetch an image's bytes + content type, or null if it does not exist. */
  get(id: string): Promise<StoredImage | null>;
  delete(id: string): Promise<void>;
}
