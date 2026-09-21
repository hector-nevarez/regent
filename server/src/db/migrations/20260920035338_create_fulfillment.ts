import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table assets (
            id                uuid primary key default gen_random_uuid(),
            order_item_id     uuid not null references order_items(id) on delete cascade,
            kind              text not null,
            storage_key       text not null,
            original_filename text,
            mime_type         text not null,
            size_bytes        bigint,
            uploaded_by       uuid references users(id) on delete set null,
            created_at        timestamptz not null default now(),

            constraint assets_kind_check check (kind in ('script', 'deliverable', 'reference')),
            constraint assets_size_check check (size_bytes is null or size_bytes > 0)
        );

        create index assets_order_item_id_idx on assets (order_item_id);
        create index assets_uploaded_by_idx on assets (uploaded_by);
        create index assets_item_kind_idx on assets (order_item_id, kind);

        create table revisions (
            id            uuid primary key default gen_random_uuid(),
            order_item_id uuid not null references order_items(id) on delete cascade,
            requested_by  uuid not null references users(id) on delete restrict,
            notes         text not null,
            status        text not null default 'requested',
            resolved_at   timestamptz,
            created_at    timestamptz not null default now(),
            updated_at    timestamptz not null default now(),

            constraint revisions_status_check check (status in ('requested', 'in_progress', 'completed', 'rejected')),
            constraint revisions_notes_check check (length(trim(notes)) > 0)
        );

        create index revisions_order_item_id_idx on revisions (order_item_id);
        create index revisions_status_idx on revisions (status);

        create trigger revisions_set_updated_at
            before update on revisions
            for each row execute function set_updated_at();
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists revisions;
        drop table if exists assets;
    `);
}

