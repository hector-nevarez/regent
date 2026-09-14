import express from 'express';
import { config } from './config';
import { db } from './db';

const app = express();
app.use(express.json());

app.get('/api/health', async (_req, res) => {
    try {
        const result = await db.raw('select 1 as ok');
        res.json({
            ok: true,
            db: result.rows[0].ok === 1,
            env: config.NODE_ENV,
        });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(503).json({ ok: false, db: false });
    }
});

app.listen( config.PORT, () => {
    console.log(`API listening on http://localhost:${config.PORT}`);
});