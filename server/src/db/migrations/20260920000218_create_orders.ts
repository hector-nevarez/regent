import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table orders (
            id             uuid primary key default gen_random_uuid(),
            user_id        uuid not null references users(id) on delete restrict,
            status         text not null default 'draft',
            currency       char(3) not null default 'USD',
            subtotal_cents bigint not null default 0,
            total_cents    bigint not null default 0,
            placed_at      timestamptz,
            created_at     timestamptz not null default now(),
            updated_at     timestamptz not null default now(),

            constraint orders_status_check check (status in (
                'draft', 'pending_payment', 'paid',
                'in_production', 'delivered', 'cancelled'
            )),
            constraint orders_amounts_check check (subtotal_cents >= 0 and total_cents >= 0),
            constraint orders_placed_at_check check (status = 'draft' or placed_at is not null)
        );

        create index orders_user_created_idx on orders (user_id, created_at desc);
        create index orders_status_idx on orders (status);

        create table order_items (
            id               uuid primary key default gen_random_uuid(),
            order_id         uuid not null references orders(id) on delete cascade,
            service_id       uuid not null references services(id) on delete restrict,
            usage_type_id    uuid not null references usage_types(id) on delete restrict,
            talent_id        uuid references talent(id) on delete restrict,
            word_count       int not null,

            -- pricing snapshot: what was true when this was ordered
            service_name     text not null,
            usage_type_label text not null,
            unit_type        text not null,
            unit_rate_cents  numeric(12, 4) not null,
            usage_multiplier numeric(6, 4) not null,
            line_total_cents bigint not null,

            -- assignment snapshot: filled when a talent is assigned
            talent_name      text,
            assigned_at      timestamptz,

            created_at       timestamptz not null default now(),

            constraint order_items_word_count_check check (word_count > 0),
            constraint order_items_line_total_check check (line_total_cents >= 0),
            constraint order_items_assignment_check check (
                (talent_id is null and talent_name is null and assigned_at is null)
                or
                (talent_id is not null and talent_name is not null and assigned_at is not null)
            )
        );

        create index order_items_order_id_idx on order_items (order_id);
        create index order_items_service_id_idx on order_items (service_id);
        create index order_items_usage_type_id_idx on order_items (usage_type_id);
        create index order_items_talent_id_idx on order_items (talent_id);

        create trigger orders_set_updated_at
            before update on orders
            for each row execute function set_updated_at();
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists order_items;
        drop table if exists orders;
    `);
}

