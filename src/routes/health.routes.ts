import { Router } from "express";
import { ping, db_health } from "../controllers/health.controller";

const router = Router();

router.get("/ping", ping);
router.get("/db-health", db_health);

export default router;
