import { ImageResponse } from 'next/og';
import { getCutById, DNA_AXES } from '@/lib/cuts-catalog';

export const runtime = 'edge';

// Dynamische Share-Card (1200×630) für Cut-Generator-Ergebnisse.
// Aufruf: /api/og/cut?cut=<id>
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cut = getCutById(searchParams.get('cut') ?? '');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#0D0A06',
          padding: '64px 72px',
          justifyContent: 'space-between',
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: '#E85018', textTransform: 'uppercase' }}>
            Dein perfekter Cut
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, color: '#F0E8D8', lineHeight: 1.05, marginTop: 8 }}>
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
    ),
    { width: 1200, height: 630 }
  );
}
