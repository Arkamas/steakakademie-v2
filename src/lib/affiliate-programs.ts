import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { AffiliateProgram, AffiliateProvider } from '@/types';

let _programs: AffiliateProgram[] | null = null;

/** Lädt die Affiliate-Programm-Registry (products/affiliate-programs.yaml). */
export function getAffiliatePrograms(): AffiliateProgram[] {
  if (_programs) return _programs;
  const filePath = path.join(process.cwd(), 'products', 'affiliate-programs.yaml');
  const raw = fs.readFileSync(filePath, 'utf-8');
  _programs = (yaml.load(raw) as AffiliateProgram[]) ?? [];
  return _programs;
}

/** Nur live im Einsatz befindliche Programme (für die rechtliche Disclosure relevant). */
export function getActivePrograms(): AffiliateProgram[] {
  return getAffiliatePrograms().filter((p) => p.status === 'active');
}

/** Programme, die geplant oder beworben, aber noch nicht freigegeben sind. */
export function getPendingPrograms(): AffiliateProgram[] {
  return getAffiliatePrograms().filter((p) => p.status !== 'active');
}

/** Findet das Programm, zu dem ein Produkt-Provider gehört. */
export function getProgramByProvider(
  provider: AffiliateProvider
): AffiliateProgram | undefined {
  return getAffiliatePrograms().find((p) => p.providers.includes(provider));
}
