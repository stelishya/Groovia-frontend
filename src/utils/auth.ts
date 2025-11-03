// src/utils/auth.ts
export type DecodedJwt = {
  userId?: string;
  role?: string[]; // backend shows ["dancer"]
  exp?: number;
  [k: string]: any;
};

export function decodeJwt(token: string | null): DecodedJwt | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}