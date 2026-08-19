import type { NextFunction, Request, Response } from "express";
import { validationResult, type ContextRunner, type FieldValidationError } from "express-validator";
import { AppError } from "./errorHandler";

/**
 * Runs a set of express-validator chains and hands any failures to the
 * central error handler as a 422 with one entry per offending field.
 */
export const validate =
  (chains: ContextRunner[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      for (const chain of chains) {
        await chain.run(req);
      }

      const result = validationResult(req);

      if (result.isEmpty()) {
        next();
        return;
      }

      const details = result.array({ onlyFirstError: true }).map((error) => ({
        field: (error as FieldValidationError).path ?? error.type,
        message: error.msg,
      }));

      next(new AppError("Validation failed", 422, details));
    } catch (err) {
      next(err as Error);
    }
  };
