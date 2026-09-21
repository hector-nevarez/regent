import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table talent(
            id                   uuid primary key default gen_random_uuid(),
            userid               uuid unique references users(id) on delete set null,
            slug                 text not null unique,
            display_name         text not null,
            tagline              text,
            bio                  text,
            headshot_storage_key text,
            is_owner             boolean not null default false,
            is_active            boolean not null default true,
            sort_order           int not null default 0,
            created_at           timestamptz not null default now(),
            updated_at           timestamptz not null default now()
        );

        create unique index talent_single_owner on talent (is_owner) where is_owner;

        create table talent_services (
            talent_id  uuid not null references talent(id) on delete cascade,
            service_id uuid not null references services(id) on delete cascade,
            created_at timestamptz not null default now(),

            primary key (talent_id, service_id)
        );

        create index talent_services_service_id_idx on talent_services (service_id);

        create table demos (
            id           uuid primary key default gen_random_uuid(),
            talent_id    uuid not null references talent(id) on delete cascade,
            service_id   uuid references services(id) on delete set null,
            title        text not null,
            storage_key  text not null,
            mime_type    text not null,
            duration_sec int not null,
            sort_order   int not null default 0,
            created_at   timestamptz not null default now(),

            constraint demos_duration_check check (duration_sec > 0)
        );

        create index demos_talent_id_idx on demos (talent_id);
        create index demos_service_id_idx on demos (service_id);

        create trigger talent_set_updated_at
            before update on talent
            for each row execute function set_updated_at();
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists demos;
        drop table if exists talent_services;
        drop table if exists talent;
    `);
}

