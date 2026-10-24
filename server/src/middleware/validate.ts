import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

type Schemas = {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
}

export const validate = (schemas: Schemas): RequestHandler => (req, _res, next) => {
    try {
        if (schemas.body) req.body = schemas.body.parse(req.body);
        if (schemas.params) req.validatedParams = schemas.params.parse(req.params);
        if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
        next()
    } catch (err) {
        next(err); // ZodError -> error handler turns it into a 400
    }
};