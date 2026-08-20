import type { Request, Response } from "express";
import { requireUser } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import UserProfile from "../models/userProfile.model";

/** The only fields a client may ever write. `user` is deliberately absent. */
const UPDATABLE_FIELDS = ["dateOfBirth", "bio"] as const;

type UpdatableField = (typeof UPDATABLE_FIELDS)[number];

interface ProfileUpdate {
  dateOfBirth?: Date | null;
  bio?: string | null;
}

/**
 * Whitelist rather than passing `req.body` through. Mongoose would strip
 * unknown keys on its own, but `user` is a *known* key — without this a caller
 * could hand their profile to another account.
 *
 * The values are already the right shape: the validators reject anything else
 * and `.toDate()` has turned `dateOfBirth` into a Date before we get here.
 */
const pickWritable = (body: unknown): ProfileUpdate => {
  const source = (body ?? {}) as Partial<Record<UpdatableField, unknown>>;
  const writable: ProfileUpdate = {};

  if (source.dateOfBirth !== undefined) {
    writable.dateOfBirth = source.dateOfBirth as Date | null;
  }

  if (source.bio !== undefined) {
    writable.bio = source.bio as string | null;
  }

  return writable;
};

/** POST /api/profile — creates the caller's profile. */
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  const auth = requireUser(req);

  // Fast path for the common case; the unique index on `user` is what actually
  // settles it when two requests race.
  if (await UserProfile.exists({ user: auth.sub })) {
    throw new AppError("A profile already exists for this account", 409);
  }

  const profile = await UserProfile.create({ user: auth.sub, ...pickWritable(req.body) });

  res.status(201).json({
    status: "success",
    message: "Profile created successfully",
    data: { profile },
  });
};

/** GET /api/profile — returns the caller's profile. */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const auth = requireUser(req);

  const profile = await UserProfile.findOne({ user: auth.sub }).populate("user", "name email role");

  if (!profile) {
    throw new AppError("You do not have a profile yet", 404);
  }

  res.status(200).json({
    status: "success",
    data: { profile },
  });
};

/** PATCH /api/profile — partial update of the caller's profile. */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const auth = requireUser(req);

  const updates = pickWritable(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError(`Provide at least one of: ${UPDATABLE_FIELDS.join(", ")}`, 400);
  }

  // `runValidators` is not the default on update queries — without it the
  // schema rules only ever run on create.
  const profile = await UserProfile.findOneAndUpdate({ user: auth.sub }, updates, {
    new: true,
    runValidators: true,
  });

  if (!profile) {
    throw new AppError("You do not have a profile yet", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: { profile },
  });
};

/** DELETE /api/profile — removes the caller's profile (the account stays). */
export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  const auth = requireUser(req);

  const profile = await UserProfile.findOneAndDelete({ user: auth.sub });

  if (!profile) {
    throw new AppError("You do not have a profile yet", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Profile deleted successfully",
  });
};
