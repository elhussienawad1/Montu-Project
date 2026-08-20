import { Schema, model, type Document, type Model, type Query, type Types } from "mongoose";
import UserProfile from "./userProfile.model";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: `Role must be one of: ${USER_ROLES.join(", ")}`,
      },
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);


/**
 * Deleting an account takes everything that belongs to it along. MongoDB has no
 * foreign keys, so "ON DELETE CASCADE" has to be written by hand — and it lives
 * on the model rather than in a controller so it holds for every delete that
 * goes through Mongoose, not just the one endpoint that happens to call it.
 * (Deletes made outside Mongoose — Compass, the raw driver, bulkWrite — bypass
 * these hooks entirely and will orphan profiles.)
 */
const cascadeDelete = async (userIds: Types.ObjectId[]): Promise<void> => {
  if (userIds.length === 0) {
    return;
  }

  await UserProfile.deleteMany({ user: { $in: userIds } });
};

/** Query middleware runs after the users are gone, so note the ids beforehand. */
interface CascadeQuery extends Query<unknown, IUser> {
  _cascadeUserIds?: Types.ObjectId[];
}

async function captureIds(this: CascadeQuery): Promise<void> {
  const doomed = await this.model.find(this.getFilter()).select("_id").lean();
  this._cascadeUserIds = doomed.map((doc) => doc._id);
}

async function runCascade(this: CascadeQuery): Promise<void> {
  await cascadeDelete(this._cascadeUserIds ?? []);
}

// user.deleteOne() on a hydrated document
userSchema.post("deleteOne", { document: true, query: false }, async function (this: IUser) {
  await cascadeDelete([this._id]);
});

// User.findOneAndDelete() / User.findByIdAndDelete() — handed the deleted doc
userSchema.post("findOneAndDelete", async function (doc: IUser | null) {
  if (doc) {
    await cascadeDelete([doc._id]);
  }
});

// User.deleteOne({...}) / User.deleteMany({...}) — no document to work from
userSchema.pre("deleteOne", { document: false, query: true }, captureIds);
userSchema.post("deleteOne", { document: false, query: true }, runCascade);
userSchema.pre("deleteMany", captureIds);
userSchema.post("deleteMany", runCascade);

export const User: Model<IUser> = model<IUser>("User", userSchema);

export default User;
