import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

/**
 * Error carrying an HTTP status code, plus optional field-level details
 * (used by the request validators to report every invalid field at once).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorPayload {
  status: "error";
  message: string;
  details?: unknown;
  stack?: string;
}

const MONGO_DUPLICATE_KEY = 11000;

/** Maps known error shapes onto a status code and a client-safe message. */
const normalize = (err: Error): { statusCode: number; message: string; details?: unknown } => {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, details: err.details };
  }

  // Mongoose schema validation (e.g. a field that slipped past the validators)
  if (err.name === "ValidationError") {
    const errors = (err as unknown as { errors: Record<string, { message: string }> }).errors ?? {};
    return {
      statusCode: 400,
      message: "Validation failed",
      details: Object.entries(errors).map(([field, e]) => ({ field, message: e.message })),
    };
  }

  // Duplicate unique index — most commonly a re-used email on signup
  if ((err as unknown as { code?: number }).code === MONGO_DUPLICATE_KEY) {
    const keys = Object.keys((err as unknown as { keyValue?: object }).keyValue ?? {});
    const field = keys[0] ?? "field";
    return { statusCode: 409, message: `A record with that ${field} already exists` };
  }

  // Malformed ObjectId and friends
  if (err.name === "CastError") {
    return { statusCode: 400, message: "Malformed request parameter" };
  }

  return { statusCode: 500, message: err.message || "Internal Server Error" };
};

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({ status: "error", message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { statusCode, message, details } = normalize(err);

  // 5xx means we broke something — keep the full trace. 4xx is the caller's input.
  if (statusCode >= 500) {
    console.error(err);
  }

  const payload: ErrorPayload = { status: "error", message };

  if (details !== undefined) {
    payload.details = details;
  }

  if (env.ENVIRONMENT === "development" && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
