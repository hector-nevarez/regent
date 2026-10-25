import type { Knex } from 'knex';
import { hashPassword } from '../../lib/password';

export async function seed(knex: Knex): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;

    await knex('users')
        .whereIn('email', [
            'owner@regent.test',
            'marcus@regent.test',
            'client@regent.test',
        ])
        .del();

    const hash = await hashPassword('devpassword123');

    const users = await knex('users')
        .insert([
            { email: 'owner@regent.test',  password_hash: hash, display_name: 'John Charly',  role: 'admin' },
            { email: 'marcus@regent.test', password_hash: hash, display_name: 'Marcus Hale', role: 'talent' },
            { email: 'client@regent.test', password_hash: hash, display_name: 'Test Client', role: 'customer' },
        ])
        .returning(['id', 'email']);

    const byEmail = Object.fromEntries(users.map((u) => [u.email, u.id]));

    await knex('talent').where({ slug: 'john-charly' })
        .update({ user_id: byEmail['owner@regent.test'] });
    await knex('talent').where({ slug: 'marcus-hale' })
        .update({ user_id: byEmail['marcus@regent.test'] });
}