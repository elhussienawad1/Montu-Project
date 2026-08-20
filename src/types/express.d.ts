import type { AccessTokenPayload } from "../utils/token";

// Lets `requireAuth` hang the verified token payload off the request without
// every downstream handler having to cast.
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
