import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { GoogleAuthService } from './google-auth.service';

interface SignInState {
  nonce: string;
  returnTo: string;
}

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly google: GoogleAuthService) {}

  // Step 1: the dashboard's "Sign in with Google" button sends the browser here
  @Get('start')
  start(@Req() req: Request, @Res() res: Response, @Query('returnTo') returnTo?: string): void {
    const nonce = randomBytes(16).toString('hex');
    const state: SignInState = { nonce, returnTo: returnTo ?? this.google.defaultReturnTo() };
    const encodedState = Buffer.from(JSON.stringify(state)).toString('base64url');

    res.cookie('g_state', nonce, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000 });
    res.redirect(this.google.authorizeUrl(this.callbackUrl(req), encodedState));
  }

  // Step 2: Google sends the browser back here with ?code=...&state=...
  @Get('callback')
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<void> {
    const { returnTo } = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as SignInState;

    const seller = await this.google.signInWithCode(code, this.callbackUrl(req));
    const token = this.google.issueSession(seller);

    res.clearCookie('g_state');
    res.redirect(`${returnTo}?token=${token}`);
  }

  // Google One Tap: the login page posts the ID token Google gave the browser
  @Post('one-tap')
  async oneTap(@Body('credential') credential: string): Promise<{ token: string }> {
    const seller = await this.google.signInWithIdToken(credential);
    return { token: this.google.issueSession(seller) };
  }

  private callbackUrl(req: Request): string {
    return `${req.protocol}://${req.get('host')}/auth/google/callback`;
  }
}
