import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { IUser } from "../models/user.model";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: IUser["role"];
}

export interface TokenBundle {
  tokenType: "Bearer";
  accessToken: string;
  expiresIn: string;
}

/** Issues the short-lived access token handed back on signup and signin. */
export const signAccessToken = (user: IUser): TokenBundle => {
  const payload: AccessTokenPayload = {
    sub: String(user._id),
    email: user.email,
    role: user.role,
  };

  const options = { expiresIn: env.JWT_EXPIRES_IN } as SignOptions;

  return {
    tokenType: "Bearer",
    accessToken: jwt.sign(payload, env.JWT_SECRET, options),
    expiresIn: env.JWT_EXPIRES_IN,
  };
};

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
