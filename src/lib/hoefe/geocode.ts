/**
 * Ort/PLZ → Koordinate, serverseitig. Der Browser des Besuchers spricht nie mit
 * dem Geocoder (keine IP-Uebertragung an Dritte, kein Consent noetig).
 *
 * 1. MapTiler Geocoding (gleicher Key wie die Kacheln, im Free-Tier enthalten).
 * 2. Fallback Nominatim (OSM) — Usage Policy: max. 1 Anfrage/s, User-Agent Pflicht.
 *    Nur als Notnagel ohne Key; bei Traffic MapTiler-Key setzen.
 * Antworten werden 30 Tage gecacht (Next fetch-Cache): Orte wandern nicht.
 */
import type { GeocodeTreffer } from './types';

const CACHE = { next: { revalidate: 60 * 60 * 24 * 30 } } as const;
const UA = 'steakakademie.de Hofladen-Radar (kontakt via steakakademie.de/kontakt)';

export function normalisiereOrt(q: string): string {
  return q.trim().replace(/\s+/g, ' ').slice(0, 80);
}

async function maptiler(q: string, key: string): Promise<GeocodeTreffer | null> {
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${encodeURIComponent(key)}&country=de&language=de&limit=1`;
  const res = await fetch(url, CACHE);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    features?: { center?: [number, number]; place_name_de?: string; place_name?: string; text?: string }[];
  };
  const f = json.features?.[0];
  if (!f?.center) return null;
  return { lng: f.center[0], lat: f.center[1], label: f.place_name_de ?? f.place_name ?? f.text ?? q };
}

async function nominatim(q: string): Promise<GeocodeTreffer | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=de&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { ...CACHE, headers: { 'User-Agent': UA, 'Accept-Language': 'de' } });
  if (!res.ok) return null;
  const json = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const f = json[0];
  if (!f) return null;
  return { lat: Number(f.lat), lng: Number(f.lon), label: f.display_name.split(',').slice(0, 2).join(',') };
}

export async function geocode(query: string): Promise<GeocodeTreffer | null> {
  const q = normalisiereOrt(query);
  if (q.length < 2) return null;
  // Reine PLZ: "Deutschland" anhaengen, sonst trifft der Geocoder Hausnummern.
  const suchtext = /^\d{5}$/.test(q) ? `${q} Deutschland` : q;
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  try {
    const treffer = key ? await maptiler(suchtext, key) : await nominatim(suchtext);
    if (!treffer) return null;
    // Nur Deutschland — der Radar kennt nichts anderes.
    if (treffer.lat < 47 || treffer.lat > 56 || treffer.lng < 5 || treffer.lng > 16) return null;
    return treffer;
  } catch {
    return null;
  }
}
