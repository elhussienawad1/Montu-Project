import type { Request, Response } from "express";
import mongoose from "mongoose";

const READY_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

const PING_TIMEOUT_MS = 2000;

export const ping = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    message: "pong",
    timestamp: new Date().toISOString(),
  });
};

export const db_health = async (_req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  const { readyState, db } = mongoose.connection;

  if (readyState !== 1 || !db) {
    res.status(503).json({
      status: "error",
      message: "database unavailable",
      database: READY_STATES[readyState] ?? "unknown",
      timestamp,
    });
    return;
  }

  const startedAt = Date.now();

  try {
    await Promise.race([
      db.admin().ping(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error("ping timed out")), PING_TIMEOUT_MS)
      ),
    ]);

    res.status(200).json({
      status: "ok",
      message: "healthy",
      database: "connected",
      latencyMs: Date.now() - startedAt,
      timestamp,
    });
  } catch (err) {
    console.error("DB health check failed:", (err as Error).message);

    res.status(503).json({
      status: "error",
      message: "database ping failed",
      database: READY_STATES[mongoose.connection.readyState] ?? "unknown",
      timestamp,
    });
  }
};
