'use client';

/**
 * Leaflet-Karte des Hofladen-Radars. Nur im Browser (dynamic import, ssr: false
 * in HofladenRadar.tsx) — Leaflet greift beim Import auf `window` zu.
 *
 * Kacheln von MapTiler (Key: NEXT_PUBLIC_MAPTILER_KEY). Die Komponente wird erst
 * gerendert, nachdem der Besucher „Karte laden" geklickt hat (KarteFreigabe in
 * HofladenRadar.tsx) — vorher geht keine IP-Adresse an MapTiler.
 * Marker sind CSS-DivIcons in Markenfarben, keine PNGs von Dritt-CDNs.
 */
import { useEffect } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { HofTreffer } from '@/lib/hoefe/types';
import { adresseZeile, entfernungLabel } from '@/lib/hoefe/format';

export const MAPTILER_STYLE = 'streets-v2-dark';

const ICON_STANDARD = L.divIcon({
  className: 'hof-marker',
  html: '<span class="hof-marker__punkt"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});
const ICON_FLEISCH = L.divIcon({
  className: 'hof-marker hof-marker--fleisch',
  html: '<span class="hof-marker__punkt"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});
const ICON_MITTE = L.divIcon({
  className: 'hof-marker hof-marker--mitte',
  html: '<span class="hof-marker__punkt"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function Ausschnitt({ mitte, km, treffer }: { mitte: { lat: number; lng: number }; km: number; treffer: HofTreffer[] }) {
  const map = useMap();
  useEffect(() => {
    if (treffer.length === 0) {
      map.setView([mitte.lat, mitte.lng], km <= 10 ? 12 : km <= 30 ? 10 : 9);
      return;
    }
    const bounds = L.latLngBounds(treffer.map((t) => [t.lat, t.lng] as [number, number]));
    bounds.extend([mitte.lat, mitte.lng]);
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
  }, [map, mitte.lat, mitte.lng, km, treffer]);
  return null;
}

export default function HofKarte({
  mitte,
  km,
  treffer,
  apiKey,
  aktiv,
}: {
  mitte: { lat: number; lng: number };
  km: number;
  treffer: HofTreffer[];
  apiKey: string;
  aktiv: string | null;
}) {
  return (
    <MapContainer
      center={[mitte.lat, mitte.lng]}
      zoom={10}
      scrollWheelZoom={false}
      className="h-[420px] w-full sm:h-[520px]"
      aria-label="Karte der gefundenen Hofläden"
    >
      <TileLayer
        url={`https://api.maptiler.com/maps/${MAPTILER_STYLE}/{z}/{x}/{y}.png?key=${encodeURIComponent(apiKey)}`}
        attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap-Mitwirkende</a>'
        maxZoom={19}
        crossOrigin="anonymous"
      />
      <Ausschnitt mitte={mitte} km={km} treffer={treffer} />
      <Circle
        center={[mitte.lat, mitte.lng]}
        radius={km * 1000}
        pathOptions={{ color: '#C8882A', weight: 1, fillColor: '#C8882A', fillOpacity: 0.05, dashArray: '4 6' }}
      />
      <Marker position={[mitte.lat, mitte.lng]} icon={ICON_MITTE} interactive={false} />
      {treffer.map((t) => (
        <Marker
          key={t.id}
          position={[t.lat, t.lng]}
          icon={t.verkauft_fleisch ? ICON_FLEISCH : ICON_STANDARD}
          zIndexOffset={t.id === aktiv ? 1000 : t.verkauft_fleisch ? 100 : 0}
        >
          <Popup>
            <div className="hof-popup">
              <strong>{t.name}</strong>
              {adresseZeile(t) && <span>{adresseZeile(t)}</span>}
              <span>
                {entfernungLabel(t.entfernung_km)}
                {t.verkauft_fleisch ? ' · Fleisch belegt' : ''}
                {t.bio ? ' · Bio' : ''}
              </span>
              <Link href={`/hoefe/${t.slug}`}>Profil ansehen →</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
