import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Teilbare Badge-Card (1200×630) bei bestandener Prüfung — markenkonform.
// Params: ?tier=gold&badge=Präzisions-Griller%20Zertifikat&name=Max&stufe=3
const TIERS: Record<string, { label: string; accent: string }> = {
  bronze: { label: 'Bronze',  accent: '#CD7F32' },
  silber: { label: 'Silber',  accent: '#C0C0C0' },
  gold:   { label: 'Gold',    accent: '#F5C842' },
  platin: { label: 'Platin',  accent: '#E5E4E2' },
  master: { label: 'Meister', accent: '#FF6B35' },
};

export function GET(req: Request) {
  const url = new URL(req.url);
  const tier = (url.searchParams.get('tier') ?? 'bronze').toLowerCase();
  const t = TIERS[tier] ?? TIERS.bronze;
  const badge = url.searchParams.get('badge') ?? 'Grillmeister-Zertifikat';
  const name = url.searchParams.get('name')?.trim();
  const stufe = url.searchParams.get('stufe');
  const medalSrc = `${url.origin}/images/diplome/medal-${TIERS[tier] ? tier : 'bronze'}.png`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 30% 20%, #1a0f06 0%, #0D0A06 60%, #070504 100%)',
          padding: '64px 72px',
          alignItems: 'center',
        }}
      >
        {/* Medaille */}
        <div style={{ display: 'flex', width: '380px', height: '380px', marginRight: '56px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={medalSrc} width={380} height={380} alt="" style={{ objectFit: 'contain' }} />
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', width: '12px', height: '40px', background: '#C8882A', marginRight: '18px' }} />
            <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '6px', color: '#C8882A' }}>
              STEAKAKADEMIE
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: '24px', letterSpacing: '4px', color: t.accent, marginBottom: '8px' }}>
            {stufe ? `STUFE ${stufe} · ` : ''}{t.label.toUpperCase()}-ZERTIFIKAT
          </div>

          <div style={{ display: 'flex', fontSize: '64px', fontWeight: 800, color: '#F5EDE2', lineHeight: 1.05, maxWidth: '640px' }}>
            {badge}
          </div>

          {name ? (
            <div style={{ display: 'flex', fontSize: '34px', color: '#E8D8B8', marginTop: '24px' }}>
              verliehen an {name}
            </div>
          ) : (
            <div style={{ display: 'flex', fontSize: '30px', color: '#A89B8C', marginTop: '24px' }}>
              Grillmeister-Ausbildung · bestanden
            </div>
          )}

          <div style={{ display: 'flex', fontSize: '26px', color: '#C8882A', marginTop: '36px' }}>
            steakakademie.de/diplome
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
