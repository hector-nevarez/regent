import type { Knex } from 'knex';
import { db } from '../../db'; // TODO: Why does this work?

export type UserRow = {
    id: string;
    email: string;
    password_hash: string;
    display_name: string | null;
    role: 'customer' | 'talent' | 'admin';
    is_active: boolean;
};

// TODO: Why does the '?' work?
// TODO: Is it possible to use upper case for SQL keywords?
export async function findUserByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await db.raw(
        `select id, email, password_hash, display_name, role, is_active
        from users
        where lower(email) = lower(?)
        limit 1`,
        [email],
    );
    return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null>{
    const { rows } = await db.raw(
        `select id, email, password_hash, display_name, role, is_active
        from users
        where id = ?
        limit 1`,
        [id],
    );
    return rows[0] ?? null;
};

export async function insertUser(input: {
    email: string;
    passwordHash: string;
    displayName?:string;
}): Promise<UserRow> {
    const { rows } = await db.raw(
        `insert into users (email, password_hash, display_name) values (?,?,?)
        returning id, email, password_hash, display_name, role, is_active`,
        [input.email, input.passwordHash, input.displayName ?? null],
    );
    return rows[0];
};

export type RefreshRow = {
    id: string;
    user_id: string;
    family_id: string;
    expires_at: Date;
    revoked_at: Date | null;
}

// TODO: where do we have the refreshOtokens database?
export async function insertRefreshToken(
    trx: Knex | Knex.Transaction,
    input: {
        userId: string;
        familyId: string;
        tokenHash:string;
        expiresAt: Date;
        userAgent?: string | null;
        ip?: string | null;
    }
): Promise< {id: string} > {
    const { rows } = await trx.raw(
        `insert into refresh_tokens (user_id, family_id, token_hash, expires_at, user_agent, ip)
        values (?, ?, ?, ?, ?, ?)
        returning id`,
        [
            input.userId,
            input.familyId,
            input.tokenHash,
            input.expiresAt,
            input.userAgent ?? null,
            input.ip ?? null,
        ]
    );
    return rows[0];
};

export async function findRefreshByHash(tokenHash: string): Promise<RefreshRow | null> {
    const { rows } = await db.raw(
        `select id, user_id, family_id, expires_at, revoked_at
        from refresh_tokens
        where token_hash = ?
        limit 1`,
        [tokenHash]
    );
    return rows[0] ?? null;
};

export async function revokeToken(
    trx: Knex | Knex.Transaction,
    id: string,
    reason: string,
    replacedById?: string
): Promise<number> {
    const result = await trx.raw(
        `update refresh_tokens
        set revoked_at = now(), revoked_reason = ?, replaced_by_id = ?
        where id = ? and revoked_at is null`,
        [reason, replacedById ?? null, id]
    );
    return result.rowCount ?? 0;
};

export async function revokeFamily(
    trx: Knex | Knex.Transaction,
    familyId: string,
    reason: string
): Promise<number> {
    const result = await trx.raw(
        `update refresh_tokens
        set revoked_at = now(), revoked_reason = ?
        where family_id = ? and revoked_at is null`,
        [reason, familyId]
    );
    return result.rowCount ?? 0;
};