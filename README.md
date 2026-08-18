# Week1 Server

A Node.js + Express + TypeScript server scaffold with a clean folder layout.

## Stack

- Node.js
- Express 5
- TypeScript
- tsx (dev runtime) + nodemon (auto-reload)

## Project Structure

```
src/
  controllers/   # Request handlers (business logic)
  routes/        # Express routers
  models/        # Data models / schemas
  middleware/    # Express middleware
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