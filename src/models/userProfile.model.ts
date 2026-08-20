import { Schema, model, type Document, type Model, type Types } from "mongoose";


export interface IUserProfile extends Document {
  user: Types.ObjectId;
  dateOfBirth?: Date | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A profile must belong to a user"],
      unique: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
      validate: {
        validator: (value: Date | null) => value === null || value < new Date() && value <= new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000),
        message: "Date of birth must be a real date above 18",
      },
    },
    

    bio: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, `Bio must be at most 500 characters`],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const UserProfile: Model<IUserProfile> = model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);

export default UserProfile;
