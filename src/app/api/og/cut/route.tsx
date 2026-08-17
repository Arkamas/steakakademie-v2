import { ImageResponse } from 'next/og';
import { getCutById, DNA_AXES } from '@/lib/cuts-catalog';

export const runtime = 'edge';

// Dynamische Share-Card (1200×630) für Cut-Generator-Ergebnisse.
// Aufruf: /api/og/cut?cut=<id>
export function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const cut = getCutById(searchParams.get('cut') ?? '');

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0D0A06', position: 'relative' }}>
        {/* Stier-Maskottchen rechts. next/image gibt es in ImageResponse nicht —
            Satori rendert nur rohes <img>, daher die Regel hier bewusst aus. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${origin}/images/cut-atlas-stier.jpg`}
          alt=""
          width={560}
          height={373}
          style={{ position: 'absolute', right: 12, top: 132, width: 560, height: 373, objectFit: 'contain' }}
        />
        {/* Verlauf: links solide für Text-Lesbarkeit, rechts frei für den Stier */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(90deg, #0D0A06 44%, rgba(13,10,6,0.35) 68%, rgba(13,10,6,0) 100%)',
          }}
        />

        {/* Inhalt */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '64px 72px',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Kopf */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 12, height: 44, background: '#C8882A', marginRight: 20 }} />
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 7, color: '#C8882A' }}>
              STEAKAKADEMIE
            </div>
          </div>

          {/* Mitte */}
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 560 }}>
            <div style={{ fontSize: 22, letterSpacing: 4, color: '#E85018', textTransform: 'uppercase' }}>
              Dein perfekter Cut
            </div>
            <div style={{ fontSize: 88, fontWeight: 700, color: '#F0E8D8', lineHeight: 1.05, marginTop: 8 }}>
              {cut ? cut.nameDE : 'Cut-Generator'}
            </div>
            {cut && (
              <div style={{ fontSize: 30, color: '#9a7548', fontStyle: 'italic', marginTop: 6 }}>
                {cut.nameEN}
              </div>
            )}
          </div>

          {/* Fuß: DNA-Balken */}
          <div style={{ display: 'flex', gap: 28 }}>
            {cut
              ? DNA_AXES.map((a) => (
                  <div key={a.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 16, color: '#a8895f' }}>{a.label}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{ width: 22, height: 10, background: i <= cut.dna[a.key] ? '#C8882A' : '#3a2818' }}
                        />
                      ))}
                    </div>
                  </div>
                ))
              : (
                <div style={{ fontSize: 24, color: '#9a7548' }}>In 4 Fragen zum perfekten Steak-Cut</div>
              )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
