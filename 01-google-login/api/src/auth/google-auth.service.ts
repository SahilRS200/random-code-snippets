import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { googleConfig } from './google.config';
import { Seller, SellersService } from '../sellers/sellers.service';

interface GoogleTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface GoogleIdClaims {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  exp: number;
}

@Injectable()
export class GoogleAuthService {
  private readonly config = googleConfig();

  constructor(private readonly sellers: SellersService) {}

  defaultReturnTo(): string {
    return `${this.config.webAppUrl}/dashboard`;
  }

  authorizeUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `${this.config.authorizeUrl}?${params.toString()}`;
  }

  // Authorization-code flow: swap the code for tokens, server to server
  async signInWithCode(code: string, redirectUri: string): Promise<Seller> {
    const res = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) {
      throw new UnauthorizedException('Google sign-in failed');
    }

    const tokens = (await res.json()) as GoogleTokens;
    const claims = jwt.decode(tokens.id_token) as GoogleIdClaims;
    return this.sellers.upsertFromGoogle(claims.sub, claims.email, tokens.refresh_token);
  }

  // One Tap: the browser already has an ID token from Google
  async signInWithIdToken(idToken: string): Promise<Seller> {
    const claims = jwt.decode(idToken) as GoogleIdClaims | null;
    if (!claims || claims.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Invalid Google credential');
    }
    return this.sellers.findOrLinkByEmail(claims.email, claims.sub);
  }

  issueSession(seller: Seller): string {
    return jwt.sign({ sellerId: seller.id, role: seller.role }, this.config.sessionSecret, {
      expiresIn: '7d',
    });
  }
}
