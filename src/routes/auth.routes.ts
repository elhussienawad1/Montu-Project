import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { signinValidator, signupValidator } from "../validators/auth.validator";

const router = Router();

router.post("/signup", validate(signupValidator), signup);
router.post("/signin", validate(signinValidator), signin);

export default router;
