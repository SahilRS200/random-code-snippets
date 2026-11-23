// Google sign-in settings for the seller dashboard.

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  sessionSecret: string;
  webAppUrl: string;
}

export const googleConfig = (): GoogleConfig => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  // Drive is used by the "Import product photos" screen
  scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.readonly'],
  sessionSecret: process.env.SESSION_JWT_SECRET || 'dev-session-secret',
  webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:5173',
});
