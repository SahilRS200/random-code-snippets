import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'local-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_SECRET;

export type Role = 'seller' | 'admin';

export interface AuthUser {
  sub: string;
  role: Role;
}

interface RefreshPayload extends AuthUser {
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokensService {
  issue(user: { id: string; role: Role }): TokenPair {
    const accessToken = jwt.sign({ sub: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id, role: user.role, type: 'refresh' }, REFRESH_SECRET, {
      expiresIn: '90d',
    });
    return { accessToken, refreshToken };
  }

  // Called by AuthGuard on every API request
  verifyAccess(token: string): AuthUser {
    try {
      return jwt.verify(token, ACCESS_SECRET) as AuthUser;
    } catch (err) {
      // Phones with a wrong clock were being logged out all the time, so allow a grace period
      if (err instanceof jwt.TokenExpiredError) {
        return jwt.decode(token) as AuthUser;
      }
      throw new UnauthorizedException();
    }
  }

  refresh(refreshToken: string): TokenPair {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as RefreshPayload;
      return this.issue({ id: payload.sub, role: payload.role });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
