import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("demos").del();
    await knex("talent_services").del();
    await knex("talent").del();

    // user_id stays null — accounts get created through Phase 2 registration
    // and linked afterward. The roster exists before the logins do.
    const talent = await knex('talent')
        .insert([
        {
            slug: 'john-charly',
            display_name: 'John Charly',
            tagline: 'Warm, conversational, brand-safe.',
            bio: 'Founder. Fifteen years across national spots and long-form narration.',
            is_owner: true,
            sort_order: 1,
        },
        {
            slug: 'marcus-hale',
            display_name: 'Marcus Hale',
            tagline: 'Deep authority read. Automotive and finance.',
            sort_order: 2,
        },
        {
            slug: 'priya-nair',
            display_name: 'Priya Nair',
            tagline: 'Bright and energetic. Tech and education.',
            sort_order: 3,
        },
        ])
        .returning(['id', 'slug']);

    const t = Object.fromEntries(talent.map((r) => [r.slug, r.id]));

    const services = await knex('services').select('id', 'slug');
    const svc = Object.fromEntries(services.map((s) => [s.slug, s.id]));

    await knex('talent_services').insert([
        // The owner covers everything.
        { talent_id: t['john-charly'], service_id: svc.commercial },
        { talent_id: t['john-charly'], service_id: svc.elearning },
        { talent_id: t['john-charly'], service_id: svc.explainer },
        { talent_id: t['john-charly'], service_id: svc.ivr },

        { talent_id: t['marcus-hale'], service_id: svc.commercial },
        { talent_id: t['marcus-hale'], service_id: svc.explainer },

        { talent_id: t['priya-nair'], service_id: svc.elearning },
        { talent_id: t['priya-nair'], service_id: svc.explainer },
        { talent_id: t['priya-nair'], service_id: svc.ivr },
    ]);

    await knex('demos').insert([
        { talent_id: t['john-charly'],  service_id: svc.commercial, title: 'Retail — Warm',       storage_key: 'demos/dana-retail.mp3',      mime_type: 'audio/mpeg', duration_sec: 28, sort_order: 1 },
        { talent_id: t['john-charly'],  service_id: svc.elearning,  title: 'Compliance Module',   storage_key: 'demos/dana-compliance.mp3',  mime_type: 'audio/mpeg', duration_sec: 45, sort_order: 2 },
        { talent_id: t['john-charly'],  service_id: null,           title: 'General Reel',        storage_key: 'demos/dana-reel.mp3',        mime_type: 'audio/mpeg', duration_sec: 62, sort_order: 3 },
        { talent_id: t['marcus-hale'], service_id: svc.commercial, title: 'Automotive — Upbeat', storage_key: 'demos/marcus-auto.mp3',      mime_type: 'audio/mpeg', duration_sec: 32, sort_order: 1 },
        { talent_id: t['marcus-hale'], service_id: svc.explainer,  title: 'Fintech Product Tour',storage_key: 'demos/marcus-fintech.mp3',   mime_type: 'audio/mpeg', duration_sec: 40, sort_order: 2 },
        { talent_id: t['priya-nair'],  service_id: svc.explainer,  title: 'SaaS Product Tour',   storage_key: 'demos/priya-saas.mp3',       mime_type: 'audio/mpeg', duration_sec: 38, sort_order: 1 },
        { talent_id: t['priya-nair'],  service_id: svc.ivr,        title: 'Phone Menu — Clear',  storage_key: 'demos/priya-ivr.mp3',        mime_type: 'audio/mpeg', duration_sec: 22, sort_order: 2 },
    ]);
};
