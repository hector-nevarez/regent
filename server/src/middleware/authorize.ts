import type { RequestHandler } from 'express';
import { forbidden, unauthorized } from '../lib/errors';

type Role = 'customer' | 'talent' | 'admin';

export const requireRole = (...roles: Role[]): RequestHandler => (
    (req, _res, next) => {
        if (!req.user) return next(unauthorized());
        if (!roles.includes(req.user.role)) return next(forbidden());
        next();
    }
)