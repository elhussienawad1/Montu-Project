import type { Request, Response } from "express";

export const ping = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    message: "pong",
    timestamp: new Date().toISOString(),
  });
};
