import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Dynamisches Standard-OG-Bild (1200×630) — markenkonform, ohne statisches Asset.
// Ersetzt das fehlende /api/og überall.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#0D0A06',
          padding: '72px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: '14px',
              height: '56px',
              background: '#C8882A',
              marginRight: '24px',
            }}
          />
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '8px',
              color: '#C8882A',
            }}
          >
            STEAKAKADEMIE
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '76px',
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#F5EDE2',
              maxWidth: '960px',
            }}
          >
            Deutschlands BBQ-Wissensplattform
          </div>
          <div style={{ fontSize: '34px', color: '#A89B8C', marginTop: '28px' }}>
            Cuts · Techniken · Kerntemperaturen · Grillmeister-Diplome
          </div>
        </div>

        <div style={{ fontSize: '30px', color: '#C8882A' }}>steakakademie.de</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
