import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("usage_types").del();
    await knex("services").del();

    // Inserts seed entries
    const services = await knex("services").insert([
        {
            slug: 'commercial',
            name: 'Commercial',
            description: 'Radio, TV, and online advertising reads.',
            unit_type: 'per_word',
            base_rate_cents: 25.0,
            min_charge_cents: 15000,
            sort_order: 1,
        },
        {
            slug: 'elearning',
            name: 'E-Learning & Training',
            description: 'Course narration and internal training modules.',
            unit_type: 'per_word',
            base_rate_cents: 12.5,
            min_charge_cents: 7500,
            sort_order: 2,
        },
        {
            slug: 'explainer',
            name: 'Explainer Video',
            description: 'Product and brand explainer narration.',
            unit_type: 'per_word',
            base_rate_cents: 18.0,
            min_charge_cents: 10000,
            sort_order: 3,
        },
        {
            slug: 'ivr',
            name: 'IVR & Phone System',
            description: 'On-hold messaging and phone menu prompts.',
            unit_type: 'per_word',
            base_rate_cents: 20.0,
            min_charge_cents: 9000,
            sort_order: 4,
        },
    ])
    .returning(['id', 'slug']);

    const svc = Object.fromEntries( services.map((s) => [s.slug, s.id]) );

    await knex("usage_types").insert([
        {
            service_id: svc.commercial,
            slug: 'web-only',
            label: 'Web / Social Only', 
            multiplier: 1.0,
            license_term_months: 12,  
            sort_order: 1
        },
        {
            service_id: svc.commercial,
            slug: 'regional-broadcast', 
            label: 'Regional Broadcast',
            multiplier: 2.5,
            license_term_months: 12,
            sort_order: 2
        },
        {
            service_id: svc.commercial,
            slug: 'national-broadcast', 
            label: 'National Broadcast',
            multiplier: 5.0,
            license_term_months: 12,  
            sort_order: 3
        },
        {
            service_id: svc.commercial,
            slug: 'perpetual',          
            label: 'Perpetual / Buyout',
            multiplier: 8.0,
            license_term_months: null,
            sort_order: 4
        },

        { service_id: svc.elearning,  slug: 'internal',       label: 'Internal Use',      multiplier: 1.0, license_term_months: null, sort_order: 1 },
        { service_id: svc.elearning,  slug: 'client-facing',  label: 'Client-Facing',     multiplier: 1.5, license_term_months: 24,   sort_order: 2 },
        { service_id: svc.elearning,  slug: 'resale',         label: 'Resale / Licensed', multiplier: 2.5, license_term_months: 24,   sort_order: 3 },

        { service_id: svc.explainer,  slug: 'web-only',   label: 'Web / Social Only', multiplier: 1.0, license_term_months: 12, sort_order: 1 },
        { service_id: svc.explainer,  slug: 'paid-media', label: 'Paid Media',        multiplier: 2.0, license_term_months: 12, sort_order: 2 },

        { service_id: svc.ivr,        slug: 'standard',   label: 'Standard',          multiplier: 1.0, license_term_months: null, sort_order: 1 },
    ]);
};
