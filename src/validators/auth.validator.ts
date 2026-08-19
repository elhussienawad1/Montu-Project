import { body } from "express-validator";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export const signupValidator = [
  body("name")
    .exists({ values: "falsy" })
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters")
    .matches(/^[\p{L}][\p{L}\s'.-]*$/u)
    .withMessage("Name may only contain letters, spaces, apostrophes, dots and hyphens"),

  body("email")
    .exists({ values: "falsy" })
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .bail()
    .isLength({ max: 254 })
    .withMessage("Email must be at most 254 characters")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .exists({ values: "falsy" })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })
    .withMessage(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`
    )
    .bail()
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),

  // Optional, but when present it has to line up with `password`.
  body("confirmPassword")
    .optional()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation does not match password"),

  // `role` is never accepted from the client — it would let anyone self-promote.
  body("role").not().exists().withMessage("Role cannot be set during signup"),
];

export const signinValidator = [
  body("email")
    .exists({ values: "falsy" })
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .exists({ values: "falsy" })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string"),
];
