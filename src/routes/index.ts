import { Router, type Request, type Response } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import profileRoutes from "./profile.routes";

/**
 * Everything under `/api`. Paths declared here are relative to that mount
 * point, so the prefix lives in exactly one place — see the bottom of the file.
 */
const api = Router();

const index = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "success",
    message: "Montu API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/signup": "Create an account",
        "POST /api/auth/signin": "Exchange credentials for an access token",
      },
      profile: {
        "POST /api/profile": "Create your profile (protected)",
        "GET /api/profile": "Fetch your profile (protected)",
        "PATCH /api/profile": "Update your profile (protected)",
        "DELETE /api/profile": "Delete your profile (protected)",
      },
      health: {
        "GET /ping": "Liveness check",
        "GET /db-health": "Database connectivity check",
      },
    },
  });
};

api.get("/", index);
api.use("/auth", authRoutes);
api.use("/profile", profileRoutes);

const router = Router();

// Health checks stay at the root: hosting providers probe those by convention,
// and they aren't part of the API surface.
router.use(healthRoutes);
router.use("/api", api);

export default router;
