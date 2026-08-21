# Week1 Server

A Node.js + Express + TypeScript server scaffold with a clean folder layout.

## Stack

- Node.js
- Express 5
- TypeScript
- MongoDB Atlas + Mongoose
- express-validator (request validation), bcrypt (password hashing), jsonwebtoken (auth tokens)
- tsx (dev runtime) + nodemon (auto-reload)

## Project Structure

```
src/
  config/        # Environment loading and DB connection
  controllers/   # Request handlers (business logic)
  routes/        # Express routers
  models/        # Data models / schemas
  middleware/    # Express middleware (validation, error handling)
  validators/    # express-validator request schemas
  utils/         # Shared helpers (JWT signing)
  index.ts       # App entry point
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run in development (auto-reload):

```bash
npm run dev
```

Run once:

```bash
npm start
```

The server listens on `http://localhost:3000` by default (override with `PORT`).

## Health Check

```bash
curl http://localhost:3000/ping
# -> { "status": "ok", "message": "pong" }
```

## Authentication

Both endpoints validate the request body with `express-validator`, store only a
bcrypt hash of the password, and return a Bearer token on success.

### Sign up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Hussien Awad","email":"hussien@example.com","password":"Str0ng!Pass"}'
```

```jsonc
// 201 Created
{
  "status": "success",
  "message": "Account created successfully",
  "data": {
    "user": { "id": "...", "name": "Hussien Awad", "email": "hussien@example.com", "role": "user", "createdAt": "..." },
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOi...",
    "expiresIn": "1d"
  }
}
```

Rules: `name` 2-80 letters, valid `email` (normalised and lowercased), and a
`password` of 8-128 characters with at least one lowercase, uppercase, number
and special character. `confirmPassword` is optional but must match when sent.
`role` is rejected outright so nobody can sign themselves up as an admin.

### Sign in

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"hussien@example.com","password":"Str0ng!Pass"}'
```

Returns the same `data` shape with `"message": "Signed in successfully"`.

### Error responses

| Status | When                                                    |
| ------ | ------------------------------------------------------- |
| `422`  | Body failed validation — `details` lists each bad field |
| `409`  | Signup with an email that is already registered         |
| `401`  | Signin with a bad email or password (message is the same for both, so the response never reveals which accounts exist) |

```jsonc
// 422 Unprocessable Entity
{
  "status": "error",
  "message": "Validation failed",
  "details": [{ "field": "password", "message": "Password must contain at least one number" }]
}
```

## Scripts

| Script         | Description                         |
| -------------- | ----------------------------------- |
| `npm start`    | Start the server                    |
| `npm run dev`  | Start with nodemon + tsx (reload)   |
| `npm run build`| Type-check and compile to `dist/`   |


## Environment Variables & Secrets

The .env file containing sensitive configuration and credentials is not stored in plaintext in the repository. Instead, it is encrypted using GPG with AES-256 and stored as .env.gpg.

To decrypt the environment file during deployment:

```bash
gpg --output .env --decrypt .env.gpg
```

See `.env.example` for the full list of variables. `MONGODB_URI` and
`JWT_SECRET` are required — the server refuses to start without them.


## Postman Collection Link
https://elhussienawads-team.postman.co/workspace/My-Workspace~3767f050-f008-4209-8057-816a1d4171cd/collection/41673862-f07acc23-54c8-445f-bd2b-bdbd491bbb81?action=share&source=copy-link&creator=41673862

