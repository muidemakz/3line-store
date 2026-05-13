import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/apiResponse';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Zod schema validation middleware factory.
 * Validates the specified part of the request (body, query, params).
 * Accepts any Zod schema including ZodEffects (schemas with .refine / .superRefine).
 *
 * @example
 * router.post('/register', validate(registerSchema), authController.register);
 * router.get('/users', validate(paginationSchema, 'query'), userController.list);
 */
export const validate =
  (schema: ZodTypeAny, target: ValidateTarget = 'body') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req[target] = await schema.parseAsync(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const field = e.path.join('.');
          errors[field] = errors[field] ? [...errors[field], e.message] : [e.message];
        });
        sendError(res, 'Validation failed', StatusCodes.UNPROCESSABLE_ENTITY, errors);
        return;
      }
      next(error);
    }
  };
