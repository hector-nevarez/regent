import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { config } from '../config';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if(err instanceof ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: err.issues.map((i) => ({
                    path: i.path.join('.'),
                    message: i.message,
                })),
            },
        });
    }

    if (err instanceof AppError) {
        return res.status(err.status).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            },
        });
    }

    // Anything reaching here is a bug. Log it, tell the client nothing.
    console.error('Unhandled error: ', err);
    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong',
            ...(config.NODE_ENV === 'development' && { debug: String(err) }),
        },
    });
};