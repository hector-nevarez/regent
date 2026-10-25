import { db } from '../../db';
import { conflict, unauthorized } from '../../lib/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import { generateRefreshToken, hashToken, newFamilyId, refreshExpiry, signAccessToken } from '../../lib/tokens';
import * as repo from './auth.repository';
import type { LoginInput, RegisterInput } from './auth.schemas';

type Context = { userAgent?: string | null; ip?: string | null };

type Session = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        displayName: string | null;
        role: string;
    };
};

// TODO: Why if the parenthesis are removed it becomes an error?
const publicUser = (u: repo.UserRow) => ({
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    role: u.role
});

async function issueSession(user: repo.UserRow, familyId: string, ctx: Context): Promise<Session> {
    const { raw, hash } = generateRefreshToken();

    await repo.insertRefreshToken(db, {
        userId: user.id,
        familyId,
        tokenHash: hash,
        expiresAt:refreshExpiry(),
        userAgent: ctx.userAgent,
        ip: ctx.ip
    });

    return {
        accessToken: signAccessToken({ sub: user.id, role: user.role }),
        refreshToken: raw,
        user: publicUser(user)
    };
};

export async function register(
    input: RegisterInput,
    ctx: Context
): Promise<Session> {
    const existing = await repo.findUserByEmail(input.email);
    if (existing) throw conflict('An account with that email already exists');

    const user = await repo.insertUser({
        email: input.email,
        passwordHash: await hashPassword(input.password),
        displayName: input.displayName
    });

    return issueSession(user, newFamilyId(), ctx);
};

export async function login(input: LoginInput, ctx: Context): Promise<Session> {
    const user = await repo.findUserByEmail(input.email);

    const ok = await verifyPassword(user?.password_hash ?? null, input.password);

    if (!user || !ok || !user.is_active){
        throw unauthorized('Invalid user or password');
    }

    return issueSession(user, newFamilyId(), ctx);
}

export async function refresh(rawToken: string, ctx: Context): Promise<Session> {
    const presented = await repo.findRefreshByHash(hashToken(rawToken));
    if (!presented) throw unauthorized('Invalid session');

    // Reuse detection: a revoked token means it leaked.
    if (presented.revoked_at !== null){
        await db.transaction((trx) =>
            repo.revokeFamily(trx, presented.family_id, 'reuse_detected'),
        );
        throw unauthorized('Session revoked');
    }

    if (presented.expires_at.getTime() < Date.now()) {
        throw unauthorized('Session expired');
    }

    const user = await repo.findUserById(presented.user_id);
    if (!user || !user.is_active) throw unauthorized('Invalid session');

    // Rotate: new token in, old token out, atomically.
    const session = await db.transaction(async (trx) => {
        // TODO: Why don't we use 'issueSeesion' instead of manually generate the hash, insert the token...?
        const { raw, hash } = generateRefreshToken();

        const created = await repo.insertRefreshToken(trx,{
            userId: user.id,
            familyId: presented.family_id,
            tokenHash: hash,
            expiresAt: refreshExpiry(),
            userAgent: ctx.userAgent,
            ip: ctx.ip
        });

        const claimed = await repo.revokeToken(trx, presented.id, 'rotated', created.id);
        if ( claimed === 0 ){
            await repo.revokeFamily(trx, presented.family_id, 'reuse_detected');
            return null;
        }

        return {
            accessToken: signAccessToken({ sub: user.id, role: user.role}),
            refreshToken: raw,
            user: publicUser(user),
        };
    });

    if (session === null) throw unauthorized('Session revoked');
    return session;
}

export async function logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;

    const row = await repo.findRefreshByHash(hashToken(rawToken));
    if (!row) return;
    await db.transaction((trx) => repo.revokeFamily(trx, row.family_id, 'logout'));
}