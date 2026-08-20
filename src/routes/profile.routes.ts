import { Router } from "express";
import {
  createProfile,
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProfileValidator, updateProfileValidator } from "../validators/profile.validator";

const router = Router();


router.use(requireAuth);

router.post("/", validate(createProfileValidator), createProfile);
router.get("/", getProfile);
router.patch("/", validate(updateProfileValidator), updateProfile);
router.delete("/", deleteProfile);

export default router;
