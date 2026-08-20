import { body } from "express-validator";

const BIO_MAX_LENGTH = 500;

/**
 * `optional({ values: "null" })` lets a field be omitted *or* sent as null —
 * omitted means "leave it alone", null means "clear it".
 */
const dateOfBirth = body("dateOfBirth")
  .optional({ values: "null" })
  .bail()
  .toDate();

const bio = body("bio")
  .optional({ values: "null" })
  .isString()
  .withMessage("Bio must be a string")
  .bail()
  .trim()
  .isLength({ max: BIO_MAX_LENGTH })
  .withMessage(`Bio must be at most ${BIO_MAX_LENGTH} characters`);

// The owner comes from the access token, never from the body — otherwise any
// caller could write a profile onto someone else's account.
const owner = body("user").not().exists().withMessage("Profile owner cannot be set by the client");

export const createProfileValidator = [owner, dateOfBirth, bio];

// Same rules; PATCH additionally requires at least one field, which the
// controller checks since it depends on which keys survived the whitelist.
export const updateProfileValidator = [owner, dateOfBirth, bio];
