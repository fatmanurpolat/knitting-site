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
  app.get<{ Params: { id: string } }>('/media/:id', async (req, reply) => {
    const image = await images.get(req.params.id);
    if (!image) {
      reply.code(404);
      return reply.send('Not found');
    }
    reply.header('Content-Type', image.contentType);
    reply.header(
      'Cache-Control',
      config.env === 'production' ? 'public, max-age=604800, immutable' : 'no-cache',
    );
    return reply.send(image.bytes);
  });
}
