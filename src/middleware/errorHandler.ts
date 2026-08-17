import type { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({ status: "error", message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);
  res.status(500).json({ status: "error", message: err.message || "Internal Server Error" });
};
