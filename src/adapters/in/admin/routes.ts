import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CatalogAdmin } from '../../../domain/ports/in/CatalogAdmin';
import { AppConfig } from '../../../infrastructure/config';
import { Product, ProductInput, slugify, toTranslations } from '../../../domain/model/Product';
import { isProductCategory } from '../../../domain/model/ProductCategory';
import { parsePriceToCents, ValidationError } from '../../../application/AdminService';
import { formatPrice } from '../web/viewModel';
import { checkCredentials, clearLoginCookie, isAuthenticated, setLoginCookie } from './auth';

interface AdminDeps {
  config: AppConfig;
  admin: CatalogAdmin;
}

interface ParsedForm {
  fields: Record<string, string>;
  file?: { buffer: Buffer; mimetype: string; filename: string };
}

/** Read a multipart product form: text fields + at most one uploaded file. */
async function readMultipart(req: FastifyRequest): Promise<ParsedForm> {
  const fields: Record<string, string> = {};
  let file: ParsedForm['file'];
  for await (const part of req.parts()) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer();
      if (part.filename && buffer.length > 0) {
        file = { buffer, mimetype: part.mimetype, filename: part.filename };
      }
    } else {
      fields[part.fieldname] = String(part.value ?? '');
    }
  }
  return { fields, file };
}

/** Build the per-locale name/description map from the form fields. */
function translationsFromFields(fields: Record<string, string>): ProductInput['translations'] {
  return toTranslations({
    tr: { name: fields.name, description: fields.description },
    en: { name: fields.name_en, description: fields.description_en },
    de: { name: fields.name_de, description: fields.description_de },
  });
}

function buildInput(
  fields: Record<string, string>,
  imageId: string | null,
  existing?: Product,
): ProductInput {
  const translations = translationsFromFields(fields);
  if (!translations.tr.name) throw new ValidationError('İsim (TR) zorunludur.');

  const category = (fields.category ?? '').trim();
  if (!isProductCategory(category)) throw new ValidationError("Kategori 'doll' veya 'bag' olmalı.");

  const slug = (fields.slug ?? '').trim()
    ? slugify(fields.slug!)
    : slugify(existing?.slug || translations.tr.name);
  const orderRaw = (fields.order ?? '').trim();
  const order = orderRaw ? Number.parseInt(orderRaw, 10) : existing?.order ?? 0;
  if (!Number.isFinite(order)) throw new ValidationError('Sıra sayısı geçersiz.');

  return {
    slug,
    category,
    translations,
    priceCents: parsePriceToCents(fields.price),
    currency: ((fields.currency ?? existing?.currency ?? 'TRY').trim().toUpperCase()) || 'TRY',
    imageId,
    etsyUrl: (fields.etsyUrl ?? '').trim(),
    instagramUrl: (fields.instagramUrl ?? '').trim(),
    featured: ['on', 'true', '1'].includes(fields.featured ?? ''),
    order,
  };
}

/** A blank product for the "new" form / for re-rendering after a validation error. */
function draftFromFields(fields: Record<string, string> = {}, imageId: string | null = null): Product {
  const translations = translationsFromFields(fields);
  return {
    id: '',
    slug: fields.slug ?? '',
    category: (isProductCategory(fields.category ?? '') ? fields.category : 'doll') as Product['category'],
    name: translations.tr.name,
    description: translations.tr.description,
    translations,
    priceCents: 0,
    currency: (fields.currency ?? 'TRY') || 'TRY',
    imageId,
    image: imageId ? `/media/${imageId}` : '',
    etsyUrl: fields.etsyUrl ?? '',
    instagramUrl: fields.instagramUrl ?? '',
    featured: ['on', 'true', '1'].includes(fields.featured ?? ''),
    order: Number.parseInt(fields.order ?? '', 10) || 0,
  };
}

export async function registerAdminRoutes(
  app: FastifyInstance,
  { config, admin }: AdminDeps,
): Promise<void> {
  const ctx = { brandName: config.brand.name, formatPrice };

  // ── public: login / logout ────────────────────────────────────────────────
  app.get<{ Querystring: { error?: string } }>('/admin/login', async (req, reply) => {
    if (isAuthenticated(req)) return reply.redirect('/admin');
    return reply.view('admin/login.ejs', {
      ...ctx,
      error: req.query.error ? 'Kullanıcı adı veya şifre hatalı.' : null,
      disabled: !config.admin.password,
    });
  });

  app.post<{ Body: { user?: string; password?: string } }>('/admin/login', async (req, reply) => {
    const user = (req.body?.user ?? config.admin.user).trim();
    const password = req.body?.password ?? '';
    if (checkCredentials(config, user, password)) {
      setLoginCookie(reply, config);
      return reply.redirect('/admin');
    }
    return reply.redirect('/admin/login?error=1');
  });

  app.post('/admin/logout', async (_req, reply) => {
    clearLoginCookie(reply);
    return reply.redirect('/admin/login');
  });

  // ── guarded: everything else under /admin ──────────────────────────────────
  await app.register(async (g) => {
    g.addHook('onRequest', async (req, reply) => {
      if (!isAuthenticated(req)) {
        return reply.redirect('/admin/login');
      }
    });

    g.get('/admin', async (_req, reply) => {
      const products = await admin.listAll();
      return reply.view('admin/list.ejs', { ...ctx, products });
    });

    g.get('/admin/products/new', async (_req, reply) => {
      return reply.view('admin/form.ejs', {
        ...ctx,
        mode: 'new',
        action: '/admin/products',
        product: draftFromFields(),
        error: null,
      });
    });

    g.post('/admin/products', async (req, reply) => {
      const { fields, file } = await readMultipart(req);
      try {
        const imageId = file ? await admin.uploadImage(file.buffer, file.mimetype) : null;
        const input = buildInput(fields, imageId);
        if (!(fields.order ?? '').trim()) input.order = await admin.nextOrder(input.category);
        await admin.createProduct(input);
        return reply.redirect('/admin');
      } catch (err) {
        return renderFormError(reply, err, 'new', '/admin/products', draftFromFields(fields));
      }
    });

    g.get<{ Params: { id: string } }>('/admin/products/:id/edit', async (req, reply) => {
      const product = await admin.getById(req.params.id);
      if (!product) return reply.redirect('/admin');
      return reply.view('admin/form.ejs', {
        ...ctx,
        mode: 'edit',
        action: `/admin/products/${product.id}`,
        product,
        error: null,
      });
    });

    g.post<{ Params: { id: string } }>('/admin/products/:id', async (req, reply) => {
      const existing = await admin.getById(req.params.id);
      if (!existing) return reply.redirect('/admin');
      const { fields, file } = await readMultipart(req);
      try {
        const imageId = file ? await admin.uploadImage(file.buffer, file.mimetype) : existing.imageId;
        const input = buildInput(fields, imageId, existing);
        await admin.updateProduct(existing.id, input);
        return reply.redirect('/admin');
      } catch (err) {
        const draft = { ...draftFromFields(fields, existing.imageId), id: existing.id };
        return renderFormError(reply, err, 'edit', `/admin/products/${existing.id}`, draft);
      }
    });

    g.post<{ Params: { id: string } }>('/admin/products/:id/delete', async (req, reply) => {
      await admin.deleteProduct(req.params.id);
      return reply.redirect('/admin');
    });

    function renderFormError(
      reply: FastifyReply,
      err: unknown,
      mode: 'new' | 'edit',
      action: string,
      product: Product,
    ) {
      const message = err instanceof ValidationError ? err.message : 'Bir hata oluştu. Tekrar deneyin.';
      reply.code(400);
      return reply.view('admin/form.ejs', { ...ctx, mode, action, product, error: message });
    }
  });
}
