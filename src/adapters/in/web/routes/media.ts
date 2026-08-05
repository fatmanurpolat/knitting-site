import { FastifyInstance } from 'fastify';
import { ImageStore } from '../../../../domain/ports/out/ImageStore';
import { AppConfig } from '../../../../infrastructure/config';

/**
 * Serves product images straight from the {@link ImageStore} (the database in
 * production) at /media/:id — so all product photos come from the DB.
 */
export async function registerMediaRoutes(
  app: FastifyInstance,
  { images, config }: { images: ImageStore; config: AppConfig },
): Promise<void> {
  const RASTER = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  app.get<{ Params: { id: string } }>('/media/:id', async (req, reply) => {
    const image = await images.get(req.params.id);
    if (!image) {
      reply.code(404);
      return reply.send('Not found');
    }
    // Defence in depth: never serve a stored blob as an active type (e.g. a
    // legacy SVG/HTML row). Force a known-safe raster type or a plain download.
    const safeType = RASTER.has(image.contentType) ? image.contentType : 'application/octet-stream';
    // The id is a content-immutable key, so it doubles as a strong ETag.
    const etag = `"${req.params.id}"`;
    if (req.headers['if-none-match'] === etag) {
      reply.code(304);
      return reply.send();
    }
    reply.header('Content-Type', safeType);
    reply.header('Content-Disposition', 'inline');
    reply.header('ETag', etag);
    reply.header(
      'Cache-Control',
      config.env === 'production' ? 'public, max-age=604800, immutable' : 'no-cache',
    );
    return reply.send(image.bytes);
  });
}
