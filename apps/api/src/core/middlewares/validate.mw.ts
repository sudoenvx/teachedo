import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ValidationError } from '../../shared/contracts/api-error';

export interface RequestValidationSchema {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}

function setReqProp(req: Request, prop: 'query' | 'params', value: unknown): void {
    Object.defineProperty(req, prop, {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
    });
}

export function validate(schema: ZodTypeAny | RequestValidationSchema) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if ('parseAsync' in schema && typeof schema.parseAsync === 'function') {
                const result = (await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                })) as { body?: unknown; query?: unknown; params?: unknown };

                if (result.body !== undefined) req.body = result.body;
                if (result.query !== undefined) setReqProp(req, 'query', result.query);
                if (result.params !== undefined) setReqProp(req, 'params', result.params);
            } else {
                const typedSchema = schema as RequestValidationSchema;

                if (typedSchema.body) {
                    req.body = await typedSchema.body.parseAsync(req.body);
                }
                if (typedSchema.query) {
                    const parsedQuery = await typedSchema.query.parseAsync(req.query);
                    setReqProp(req, 'query', parsedQuery);
                }
                if (typedSchema.params) {
                    const parsedParams = await typedSchema.params.parseAsync(req.params);
                    setReqProp(req, 'params', parsedParams);
                }
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.issues.map((issue) => {
                    const path = issue.path.join('.');
                    return path ? `${path}: ${issue.message}` : issue.message;
                });
                next(new ValidationError(details as never));
                return;
            }
            next(error);
        }
    };
}