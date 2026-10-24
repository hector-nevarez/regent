import type { RequestHandler } from 'express';
import { unauthorized } from '../lib/errors';
import { verifyAccessToken } from '../lib/tokens';

export const authenticate: RequestHandler = (req, _res, next) => {
    const header = req.get('authorization');
    if (!header?.startsWith('Bearer ')) {
        return next(unauthorized('Missing access token'));
    }
    try {
        req.user = verifyAccessToken(header.slice(7));
        next();
    } catch {
        next(unauthorized('Invalid or expired access token'));
    }
};