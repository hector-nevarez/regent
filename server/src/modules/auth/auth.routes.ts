import { Router } from 'express';
import type { CookieOptions } from 'express';
import { config } from '../../config';
import { unauthorized } from '../../lib/errors';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schemas';
import * as service from './auth.service';
import * as repo from './auth.repository';
import { requireRole } from '../../middleware/authorize';

export const authRoutes = Router();

const REFRESH_COOKIE = 'regent_refresh';

const cookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
});

// Postgres `inet` rejects anything that isn't an address, and req.ip is not
// guaranteed to be one. Anything unparseable becomes null
const IP_RE = /^[0-9a-fA-F:.]{3,45}$/;

const ctxOf = (req: { get: (h: string) => string | undefined; ip?: string }) => ({
    userAgent: req.get('user-agent')?.slice(0, 500) ?? null,
    ip: req.ip && IP_RE.test(req.ip) ? req.ip : null,
});

authRoutes.post('/register', validate({ body: registerSchema}), async (req, res) => {
    const session = await service.register(req.body, ctxOf(req));
    res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions());
    res.status(201).json({ accessToken: session.accessToken, user: session.user });
});

authRoutes.post('/login', validate({ body: loginSchema}), async (req, res) => {
    const session = await service.login(req.body, ctxOf(req));
    res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions());
    res.json({ accessToken: session.accessToken, user: session.user});
});

authRoutes.post('/refresh', async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) throw unauthorized('No session');

    const session = await service.refresh(raw, ctxOf(req));
    res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions());
    res.json({ accessToken: session.accessToken, user: session.user });
});

authRoutes.post('/logout', async (req, res) => {
    await service.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: undefined });
    res.status(204).send();
});

authRoutes.get('/me', authenticate, async (req, res) => {
    const user = await repo.findUserById(req.user!.sub);
    if (!user) throw unauthorized();
    res.json({
        user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.role,
        }
    });
});

authRoutes.get('/admin-ping', authenticate, requireRole('admin'), (_req, res) => {
    res.json({ ok: true });
});