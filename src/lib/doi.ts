/**
 * Double-Opt-In Token Utility
 *
 * Erstellt und verifiziert HMAC-SHA256-signierte DOI-Tokens.
 * Stateless — kein Datenbankzustand nötig.
 */

import { createHmac, timingSafeEqual } from 'crypto';

const DOI_SECRET = process.env.NEWSLETTER_DOI_SECRET ?? 'dev-only-insecure-secret';
const TOKEN_MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 Stunden

export interface TokenPayload {
  email: string;
  iat: number;
  source?: string;
  userGroup?: string;
}

/**
 * Erstellt einen signierten, zeitgestempelten DOI-Token.
 * Format: base64url(JSON{email,iat}) + "." + HMAC-SHA256-Signatur
 * Gültig für 48 Stunden.
 */
export function createDOIToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.toLowerCase().trim(), iat: Date.now() }),
  ).toString('base64url');
  const sig = createHmac('sha256', DOI_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/**
 * Verifiziert einen DOI-Token zeitkonstant.
 * Gibt das Payload-Objekt zurück oder null bei Ungültigkeit.
 */
export function verifyDOIToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  // HMAC prüfen (timing-safe)
  const expectedSig = createHmac('sha256', DOI_SECRET).update(payloadB64).digest('base64url');
  try {
    const sigBuf = Buffer.from(sig, 'base64url');
    const expectedBuf = Buffer.from(expectedSig, 'base64url');
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  // Payload dekodieren und Laufzeit prüfen
  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8'),
    );
    if (!payload.email || typeof payload.iat !== 'number') return null;
    if (Date.now() - payload.iat > TOKEN_MAX_AGE_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
