import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table refresh_tokens (
            id             uuid primary key default gen_random_uuid(),
            user_id        uuid not null references users(id) on delete cascade,
            family_id      uuid not null,
            token_hash     text not null unique,
            issued_at      timestamptz not null default now(),
            expires_at     timestamptz not null,
            revoked_at     timestamptz,
            revoked_reason text,
            replaced_by_id uuid references refresh_tokens(id) on delete set null,
            user_agent     text,
            ip             inet,

            constraint refresh_tokens_revocation_check check (
                (revoked_at is null and revoked_reason is null)
                or
                (revoked_at is not null and revoked_reason is not null)
            ),
            constraint refresh_tokens_reason_check check (
                revoked_reason is null or revoked_reason in (
                'rotated', 'logout', 'reuse_detected', 'password_change', 'admin_revoke'
                )
            )
        );

        create index refresh_tokens_user_id_idx on refresh_tokens (user_id);
        create index refresh_tokens_family_id_idx on refresh_tokens (family_id);
        create index refresh_tokens_expires_at_idx on refresh_tokens (expires_at);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`drop table if exists refresh_tokens;`);
}