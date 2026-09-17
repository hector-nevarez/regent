import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
            create or replace functions set_updated_at()
            returns trigger
            language plpgsql
            as $$
            begin
                new.updated_at = now();
                return new;
            end;
            $$;
        `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`drop function if exists set_updated_at();`)
}
