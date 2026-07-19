import crypto from 'node:crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../../infrastructure/config';

export const ADMIN_COOKIE = 'og_admin';
const ONE_WEEK = 60 * 60 * 24 * 7;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** True only when a password is configured and the credentials match. */
export function checkCredentials(config: AppConfig, user: string, password: string): boolean {
  if (!config.admin.password) return false; // dashboard disabled without a password
  return safeEqual(user, config.admin.user) && safeEqual(password, config.admin.password);
}

export function setLoginCookie(reply: FastifyReply, config: AppConfig): void {
  reply.setCookie(ADMIN_COOKIE, 'ok', {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    path: '/',
    maxAge: ONE_WEEK,
  });
}

export function clearLoginCookie(reply: FastifyReply): void {
  reply.clearCookie(ADMIN_COOKIE, { path: '/' });
}

export function isAuthenticated(req: FastifyRequest): boolean {
  const raw = req.cookies?.[ADMIN_COOKIE];
  if (!raw) return false;
  const un = req.unsignCookie(raw);
  return un.valid && un.value === 'ok';
}
