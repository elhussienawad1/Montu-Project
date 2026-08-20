import dotenv from "dotenv";

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    // Names only, never values. Seeing what *did* arrive is the fastest way to
    // tell a typo apart from "the host injected nothing at all".
    const present = Object.keys(process.env)
      .filter((name) => !name.startsWith("npm_"))
      .sort()
      .join(", ");

    throw new Error(
      `Missing required environment variable: ${key}\nVariables present at startup: ${present}`
    );
  }

  return value;
};

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  ENVIRONMENT: process.env.ENVIRONMENT || "development",
  MONGODB_URI: required("MONGODB_URI"),
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "montu",
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
};
