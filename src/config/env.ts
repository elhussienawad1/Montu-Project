import dotenv from "dotenv";

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  ENVIRONMENT: process.env.ENVIRONMENT || "development",
  MONGODB_URI: required("MONGODB_URI"),
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "montu",
};
