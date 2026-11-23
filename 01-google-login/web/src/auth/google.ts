// Dashboard helpers for Google sign-in and the "Import product photos" screen.

const API_URL = import.meta.env.VITE_API_URL as string;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string;

// "Sign in with Google" button
export const startGoogleSignIn = (): void => {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo') ?? window.location.href;
  window.location.href = `${API_URL}/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`;
};

// Runs when the dashboard loads after the API redirects back with ?token=...
export const saveSessionFromUrl = (): void => {
  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    localStorage.setItem('session', token);
  }
};

// The Drive import needs a fresh Google access token every hour
export const refreshGoogleAccessToken = async (googleRefreshToken: string): Promise<string> => {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: googleRefreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const body = (await res.json()) as { access_token: string };
  return body.access_token;
};
