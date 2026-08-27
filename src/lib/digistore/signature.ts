import { createHash } from 'node:crypto';

/**
 * Digistore24-Signatur (Referenz: digistore24.com/download/ipn/examples/ipn/sha_sign.php):
 * sha_sign/SHASIGN entfernen, Schluessel case-sensitiv sortieren, je Feld
 * `KEY=value<passphrase>` anhaengen (leere Werte ueberspringen), SHA-512, Hex in Grossbuchstaben.
 */
export function digistoreSignature(passphrase: string, params: Record<string, string>): string {
  const keys = Object.keys(params).filter((k) => k !== 'sha_sign' && k !== 'SHASIGN').sort();
  let s = '';
  for (const k of keys) {
    const v = params[k];
    if (v === undefined || v === '') continue;
    s += `${k}=${v}${passphrase}`;
  }
  return createHash('sha512').update(s, 'utf8').digest('hex').toUpperCase();
}
