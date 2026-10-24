import type { AccessTokenPayload } from '../lib/tokens';

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
            validatedParams?: unknown;
            validatedQuery?: unknown;
        }
    }
}

export {};