import { randomUUID } from 'node:crypto';
import { ImageStore, StoredImage } from '../../../domain/ports/out/ImageStore';

/** In-memory {@link ImageStore} for running without a database. Ephemeral. */
export class InMemoryImageStore implements ImageStore {
  private readonly store = new Map<string, StoredImage>();

  async save(bytes: Buffer, contentType: string): Promise<string> {
    const id = randomUUID();
    this.store.set(id, { bytes, contentType });
    return id;
  }

  async get(id: string): Promise<StoredImage | null> {
    return this.store.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
