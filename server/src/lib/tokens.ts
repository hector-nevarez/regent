import { randomBytes, createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export type AccessTokenPayload = {
    sub: string;
    role: 'customer' | 'talent' | 'admin'
};

export const signAccessToken = (payload: AccessTokenPayload): string => jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_TTL_SECONDS,
    issuer: 'regent',
});

export const verifyAccessToken = (token: string): AccessTokenPayload => 
    jwt.verify(token, config.JWT_ACCESS_SECRET, {
        issuer: 'regent',
    }
) as AccessTokenPayload;

export const newFamilyId = () => randomUUID();

// Returns the raw token (goes to the client) and its hash (goes to the DB).
export function generateRefreshToken() {
    const raw = randomBytes(32).toString('base64url');
    return { raw, hash: hashToken(raw) };
}

export const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex');

export function refreshExpiry(): Date {
    const d = new Date();
    d.setDate(d.getDate() + config.REFRESH_TOKEN_TTL_DAYS);
    return d;
}