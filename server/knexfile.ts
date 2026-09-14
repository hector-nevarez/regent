import type { Knex } from "knex";
import { config } from './src/config';

// Update with your config settings.
const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: config.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
  },
};

export default knexConfig;