import express from 'express';
import cookieParser from 'cookie-parser';
import { db } from './db';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { config } from './config';

export const app = express();

// Only trust a proxy where one actually sits in front of you.
if (config.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(express.json({ limit: '100kb'}));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
    const result = await db.raw(`select 1 as ok`);
    res.json({ ok: true, db: result.rows[0].ok === 1 });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not Found' } });
});

app.use(errorHandler);