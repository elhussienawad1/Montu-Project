import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/token";

const BEARER_PREFIX = "Bearer ";

/**
 * Rejects anything without a valid, unexpired access token, and attaches the
 * decoded payload to the request. Every protected route sits behind this.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith(BEARER_PREFIX)) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    const expired = (err as Error).name === "TokenExpiredError";
    next(new AppError(expired ? "Access token has expired" : "Invalid access token", 401));
  }
};

/**
 * Narrows `req.user` for handlers that run behind `requireAuth`, so controllers
 * get a typed payload instead of a non-null assertion.
 */
export const requireUser = (req: Request): AccessTokenPayload => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  return req.user;
};
