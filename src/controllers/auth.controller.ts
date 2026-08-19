import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import User, { type IUser } from "../models/user.model";
import { signAccessToken } from "../utils/token";

/**
 * A bcrypt hash of a throwaway value. Compared against when no user matches so
 * that signin costs the same whether or not the email exists — otherwise the
 * response time alone leaks which accounts are registered.
 */
const DUMMY_HASH = bcrypt.hashSync("timing-attack-placeholder", env.BCRYPT_SALT_ROUNDS);

/** Deliberately vague: never tell the caller which half of the pair was wrong. */
const INVALID_CREDENTIALS = "Invalid email or password";

const publicUser = (user: IUser) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

/**
 * POST /api/auth/signup
 * Express 5 forwards rejected promises to the error handler, so thrown
 * AppErrors and Mongoose errors land in `errorHandler` without a try/catch.
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  // Fast path for the common case; the unique index below is what actually
  // guarantees uniqueness when two signups race.
  if (await User.exists({ email })) {
    throw new AppError("An account with that email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({
    status: "success",
    message: "Account created successfully",
    data: {
      user: publicUser(user),
      ...signAccessToken(user),
    },
  });
};

/** POST /api/auth/signin */
export const signin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  // `passwordHash` is `select: false` on the schema, so ask for it explicitly.
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError(INVALID_CREDENTIALS, 401);
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(INVALID_CREDENTIALS, 401);
  }

  res.status(200).json({
    status: "success",
    message: "Signed in successfully",
    data: {
      user: publicUser(user),
      ...signAccessToken(user),
    },
  });
};
