import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table users (
        id            uuid primary key default gen_random_uuid(),
        email         text not null,
        password_hash text not null,
        display_name  text,
        role          text not null default 'customer',
        is_active     boolean not null default true,
        created_at    timestamptz not null default now(),
        updated_at    timestamptz not null default now(),

        constraint users_role_check check (role in ('customer', 'talent', 'admin'))
        );

        create unique index users_email_lower_unique on users (lower(email));

        create trigger users_set_updated_at
        before update on users
        for each row execute function set_updated_at();
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`drop table if exists users;`);
}

