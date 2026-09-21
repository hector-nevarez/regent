import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table payments (
            id           uuid primary key default gen_random_uuid(),
            order_id     uuid not null references orders(id) on delete restrict,
            provider     text not null default 'stripe',
            provider_ref text not null,
            amount_cents bigint not null,
            currency     char(3) not null default 'USD',
            status       text not null,
            failure_code text,
            raw_event    jsonb,
            created_at   timestamptz not null default now(),
            updated_at   timestamptz not null default now(),

            constraint payments_status_check check (status in (
                'requires_payment', 'processing', 'succeeded', 'failed', 'refunded'
            )),
            constraint payments_amount_check check (amount_cents >= 0),
            constraint payments_provider_ref_unique unique (provider, provider_ref)
        );

        create index payments_order_id_idx on payments (order_id);

        create unique index payments_one_success_per_order
            on payments (order_id)
            where status = 'succeeded';

        create trigger payments_set_updated_at
            before update on payments
            for each row execute function set_updated_at();
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists payments;
    `);
}

