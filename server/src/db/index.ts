import knex from 'knex';
import knexConfig from '../../knexfile';
import { config } from '../config';

export const db = knex(knexConfig[config.NODE_ENV] ?? knexConfig.development)