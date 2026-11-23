# 01 · Google sign-in for the seller dashboard

Sellers sign in to the dashboard (React, `https://seller.example.in`) with their Google account.
The API (NestJS, `https://api.example.in`) runs the OAuth 2.0 authorization-code flow with Google,
then gives the dashboard its own session token. The login page also offers Google One Tap.
The "Import product photos" screen reads images from the seller's Google Drive.

## What we know

- Sign-in works on a laptop (`http://localhost:3000`).
- On staging (`https://api-staging.example.in`, behind a load balancer that ends TLS),
  Google shows `Error 400: redirect_uri_mismatch`.
- A security review is booked for next week, before launch.

## Google Cloud console settings

OAuth client type: **Web application**

Authorised redirect URIs:

- `http://localhost:3000/auth/google/callback`
- `https://api.example.in/auth/google/callback`

## Files

| File | What it does |
|---|---|
| `.env.example` | Settings for the API and the dashboard |
| `api/src/auth/google.config.ts` | Google OAuth settings |
| `api/src/auth/google-auth.controller.ts` | `GET /auth/google/start`, `GET /auth/google/callback`, `POST /auth/google/one-tap` |
| `api/src/auth/google-auth.service.ts` | Builds the Google URL, exchanges the code, issues our session |
| `web/src/auth/google.ts` | Dashboard helpers for sign-in and the Drive import |

`SellersService` isn't included. Assume each of its methods does what its name says.

## Your task

Review this sign-in flow as if you were the security reviewer.
For each problem you find, explain what breaks or what an attacker could do, and how you would fix it.
