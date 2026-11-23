import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

export type Role = 'seller' | 'admin';

export interface AuthUser {
  sub: string;
  sellerId: string;
  role: Role;
}

export interface AuthedRequest extends Request {
  user: AuthUser;
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
