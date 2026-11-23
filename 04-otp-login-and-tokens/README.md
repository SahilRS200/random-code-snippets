# 04 · OTP login, access tokens and refresh tokens

Sellers log in with their mobile number and a 6-digit code sent by SMS. After a correct code, the app
gets an **access token** (15 minutes) for API calls and a **refresh token** (90 days) to get new tokens
without logging in again. The API is NestJS with Redis, running as four pods.

## The flow

1. `POST /auth/otp { mobile }`: send a code by SMS. Codes expire after 10 minutes.
2. `POST /auth/verify { mobile, otp }`: check the code, return `{ accessToken, refreshToken }`.
3. API calls send `Authorization: Bearer <accessToken>`; `AuthGuard` calls `TokensService.verifyAccess`.
4. `POST /auth/refresh { refreshToken }`: return a new pair.
5. `POST /auth/logout`: the app deletes its tokens.

## What we know

- A seller's account was taken over last week. The logs show about 40,000 calls to `/auth/verify`
  for that number in one hour, from about 300 IP addresses.
- After an admin blocked a seller, the seller kept using the app for weeks.
- Support asked for a way to "log out everywhere" when a phone is lost. Nobody knows how to build it.

## Files

| File | What it does |
|---|---|
| `.env.example` | Settings |
| `api/src/auth/auth.controller.ts` | The five endpoints above |
| `api/src/auth/otp.service.ts` | Creates, sends and checks codes |
| `api/src/auth/tokens.service.ts` | Issues and checks tokens |

`SmsService` and `UsersService` aren't included. Assume each method does what its name says.
`ThrottlerGuard` (from `@nestjs/throttler`) is registered globally and counts requests per IP address.

## Your task

Explain how the account takeover could have happened, why blocked sellers keep access, and what else is wrong.
Then design "log out everywhere".
