import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table services (
            id               uuid primary key default gen_random_uuid(),
            slug             text not null unique,
            name             text not null,
            description      text,
            unit_type        text not null,
            base_rate_cents  numeric(12, 4) not null,
            min_charge_cents bigint not null default 0,
            is_active        boolean not null default true,
            sort_order       int not null default 0,
            created_at       timestamptz not null default now(),
            updated_at       timestamptz not null default now(),

            constraint services_unit_type_check check (unit_type in ('per_word', 'per_minute', 'flat')),
            constraint services_base_rate_check check (base_rate_cents >= 0),
            constraint services_min_charge_check check (min_charge_cents >= 0)
        );

        create table usage_types (
            id                  uuid primary key default gen_random_uuid(),
            service_id          uuid not null references services(id) on delete cascade,
            slug                text not null,
            label               text not null,
            description         text,
            multiplier          numeric(6, 4) not null,
            license_term_months int,
            is_active           boolean not null default true,
            sort_order          int not null default 0,
            created_at          timestamptz not null default now(),
            updated_at          timestamptz not null default now(),

            constraint usage_types_multiplier_check check (multiplier > 0),
            constraint usage_types_term_check check (license_term_months is null or license_term_months > 0),
            constraint usage_types_service_slug_unique unique (service_id, slug)
        );

        create index usage_types_service_id_idx on usage_types (service_id);

        create trigger services_set_updated_at
            before update on services
            for each row execute function set_updated_at();

        create trigger usage_types_set_updated_at
            before update on usage_types
            for each row execute function set_updated_at();
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists usage_types;
        drop table if exists services;
    `);
}

