'use client';

const BADGES = [
  {
    id: 1,
    stufe: 'Stufe 1',
    name: 'Der Funke',
    cert: 'Basis-Zertifikat',
    medalGradient:
      'radial-gradient(circle at 32% 28%, #F0B86A 0%, #CD7F32 38%, #9B5E1E 65%, #6B3A0E 100%)',
    ringGradient:
      'linear-gradient(135deg, #E8A050 0%, #7A4010 50%, #C8801A 100%)',
    shine: 'radial-gradient(circle at 30% 22%, rgba(255,240,200,0.55) 0%, rgba(255,200,100,0.15) 35%, transparent 65%)',
    aura: '0 0 28px rgba(205,127,50,0.55), 0 0 55px rgba(205,127,50,0.22), 0 8px 24px rgba(0,0,0,0.6)',
    textColor: '#E8A050',
    crest: (
      <svg viewBox="0 0 60 60" width="52" height="52" fill="none">
        <path d="M30 8 C26 18 16 22 16 32 C16 42 22 50 30 52 C38 50 44 42 44 32 C44 22 34 18 30 8Z"
          fill="rgba(255,180,60,0.9)" stroke="rgba(139,69,19,0.8)" strokeWidth="1.5"/>
        <path d="M30 16 C28 22 22 25 22 31 C22 38 26 44 30 46 C34 44 38 38 38 31 C38 25 32 22 30 16Z"
          fill="rgba(255,220,80,0.7)"/>
        <path d="M30 24 C29 27 26 29 26 33 C26 37 28 40 30 41 C32 40 34 37 34 33 C34 29 31 27 30 24Z"
          fill="rgba(255,255,150,0.8)"/>
      </svg>
    ),
  },
  {
    id: 2,
    stufe: 'Stufe 2',
    name: 'Die Flamme Bezähmen',
    cert: 'Silber-Zertifikat',
    medalGradient:
      'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D8D8D8 25%, #B0B0B0 55%, #787878 85%, #505050 100%)',
    ringGradient:
      'linear-gradient(135deg, #EFEFEF 0%, #888888 50%, #D5D5D5 100%)',
    shine: 'radial-gradient(circle at 28% 20%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 65%)',
    aura: '0 0 28px rgba(180,180,210,0.5), 0 0 55px rgba(160,160,180,0.2), 0 8px 24px rgba(0,0,0,0.6)',
    textColor: '#C8C8D0',
    crest: (
      <svg viewBox="0 0 60 60" width="52" height="52" fill="none">
        {/* Fork */}
        <g transform="rotate(-20, 30, 30)">
          <rect x="22" y="10" width="3" height="28" rx="1.5" fill="rgba(220,220,240,0.9)"/>
          <rect x="20" y="10" width="1.5" height="10" rx="0.75" fill="rgba(220,220,240,0.9)"/>
          <rect x="25" y="10" width="1.5" height="10" rx="0.75" fill="rgba(220,220,240,0.9)"/>
          <rect x="22.5" y="18" width="3" height="2" rx="1" fill="rgba(180,180,200,0.8)"/>
          <rect x="20" y="36" width="6" height="12" rx="3" fill="rgba(220,220,240,0.9)"/>
        </g>
        {/* Knife */}
        <g transform="rotate(20, 30, 30)">
          <rect x="35" y="10" width="3" height="28" rx="1.5" fill="rgba(220,220,240,0.9)"/>
          <path d="M35 10 C35 10 40 16 40 22 L38 22 L35 18Z" fill="rgba(200,200,220,0.9)"/>
          <rect x="34" y="36" width="5" height="12" rx="2.5" fill="rgba(220,220,240,0.9)"/>
        </g>
        {/* Cross piece */}
        <rect x="19" y="29" width="22" height="2.5" rx="1.25" fill="rgba(180,180,200,0.7)"/>
      </svg>
    ),
  },
  {
    id: 3,
    stufe: 'Stufe 3',
    name: 'Hitzekontrolle',
    cert: 'Gold-Zertifikat',
    medalGradient:
      'radial-gradient(circle at 32% 28%, #FFFACD 0%, #FFD700 22%, #C8A200 50%, #8B6914 78%, #5A4208 100%)',
    ringGradient:
      'linear-gradient(135deg, #FFE566 0%, #8B6914 50%, #FFD700 100%)',
    shine: 'radial-gradient(circle at 28% 20%, rgba(255,255,220,0.65) 0%, rgba(255,240,100,0.2) 40%, transparent 65%)',
    aura: '0 0 32px rgba(200,162,0,0.6), 0 0 65px rgba(200,136,42,0.28), 0 8px 24px rgba(0,0,0,0.6)',
    textColor: '#FFD700',
    crest: (
      <svg viewBox="0 0 60 60" width="52" height="52" fill="none">
        {/* Shield */}
        <path d="M30 8 L44 14 L44 30 C44 40 38 47 30 52 C22 47 16 40 16 30 L16 14 Z"
          fill="rgba(255,215,0,0.2)" stroke="rgba(255,200,50,0.8)" strokeWidth="1.5"/>
        {/* Torch */}
        <rect x="28.5" y="20" width="3" height="18" rx="1.5" fill="rgba(255,230,100,0.9)"/>
        <path d="M27 20 C27 20 24 16 26 12 C28 10 32 10 34 12 C36 16 33 20 33 20Z"
          fill="rgba(255,180,40,0.9)"/>
        <path d="M28.5 14 C28.5 14 27 12 29 10.5 C30.5 9.5 31.5 10.5 30 14Z"
          fill="rgba(255,255,150,0.9)"/>
        {/* Laurel branches */}
        <path d="M20 35 C20 35 22 32 24 34 C24 34 22 37 20 35Z" fill="rgba(255,200,50,0.8)"/>
        <path d="M18 38 C18 38 21 36 22 38 C22 38 20 41 18 38Z" fill="rgba(255,200,50,0.8)"/>
        <path d="M40 35 C40 35 38 32 36 34 C36 34 38 37 40 35Z" fill="rgba(255,200,50,0.8)"/>
        <path d="M42 38 C42 38 39 36 38 38 C38 38 40 41 42 38Z" fill="rgba(255,200,50,0.8)"/>
      </svg>
    ),
  },
  {
    id: 4,
    stufe: 'Stufe 4',
    name: 'Präzision & Geschmack',
    cert: 'Platin-Zertifikat',
    medalGradient:
      'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #EEF0F8 20%, #C8CDD8 45%, #9098B0 72%, #606880 100%)',
    ringGradient:
      'linear-gradient(135deg, #F0F4FF 0%, #7080A0 50%, #D8E0F0 100%)',
    shine: 'radial-gradient(circle at 28% 20%, rgba(255,255,255,0.9) 0%, rgba(220,230,255,0.35) 38%, transparent 62%)',
    aura: '0 0 30px rgba(160,180,220,0.6), 0 0 60px rgba(140,160,210,0.25), 0 8px 24px rgba(0,0,0,0.6)',
    textColor: '#C0C8E0',
    crest: (
      <svg viewBox="0 0 60 60" width="52" height="52" fill="none">
        {/* Diamond */}
        <polygon points="30,8 46,26 30,52 14,26"
          fill="rgba(200,220,255,0.3)" stroke="rgba(220,235,255,0.9)" strokeWidth="1.5"/>
        {/* Facets */}
        <polygon points="30,8 46,26 30,26" fill="rgba(240,248,255,0.5)"/>
        <polygon points="30,8 14,26 30,26" fill="rgba(180,200,240,0.4)"/>
        <polygon points="30,26 46,26 30,52" fill="rgba(160,185,230,0.4)"/>
        <polygon points="30,26 14,26 30,52" fill="rgba(200,215,245,0.35)"/>
        {/* Sparkle */}
        <circle cx="38" cy="18" r="1.5" fill="rgba(255,255,255,0.95)"/>
        <line x1="38" y1="14" x2="38" y2="22" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8"/>
        <line x1="34" y1="18" x2="42" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8"/>
        <circle cx="22" cy="32" r="1" fill="rgba(255,255,255,0.8)"/>
      </svg>
    ),
  },
  {
    id: 5,
    stufe: 'Stufe 5',
    name: 'Der Vollendete Pitmaster',
    cert: 'Meister-Diplom',
    medalGradient:
      'radial-gradient(circle at 32% 28%, #FFFDE0 0%, #FFD700 18%, #E8B800 38%, #C8882A 58%, #8B6914 78%, #4A3208 100%)',
    ringGradient:
      'linear-gradient(135deg, #FFFACD 0%, #C8882A 30%, #9B6914 55%, #FFD700 80%, #8B6000 100%)',
    shine: 'radial-gradient(circle at 28% 20%, rgba(255,255,230,0.7) 0%, rgba(255,220,80,0.25) 40%, transparent 65%)',
    aura: '0 0 38px rgba(200,136,42,0.7), 0 0 75px rgba(200,162,0,0.35), 0 0 110px rgba(200,100,20,0.15), 0 8px 28px rgba(0,0,0,0.65)',
    textColor: '#FFD700',
    isMaster: true,
    crest: (
      <svg viewBox="0 0 60 60" width="56" height="56" fill="none">
        {/* Outer shield */}
        <path d="M30 6 L46 12 L46 30 C46 42 39 50 30 55 C21 50 14 42 14 30 L14 12 Z"
          fill="rgba(255,215,0,0.15)" stroke="rgba(255,200,50,0.9)" strokeWidth="1.8"/>
        {/* Inner shield */}
        <path d="M30 13 L40 17 L40 30 C40 38 36 44 30 47 C24 44 20 38 20 30 L20 17 Z"
          fill="rgba(255,215,0,0.1)" stroke="rgba(255,180,30,0.7)" strokeWidth="1"/>
        {/* Crown */}
        <path d="M22 16 L22 11 L26 14 L30 10 L34 14 L38 11 L38 16Z"
          fill="rgba(255,220,60,0.9)" stroke="rgba(180,130,0,0.8)" strokeWidth="0.8"/>
        {/* Stars in crown */}
        <circle cx="30" cy="13" r="1.2" fill="rgba(255,255,180,0.95)"/>
        <circle cx="24.5" cy="14" r="0.9" fill="rgba(255,255,180,0.8)"/>
        <circle cx="35.5" cy="14" r="0.9" fill="rgba(255,255,180,0.8)"/>
        {/* Center torch */}
        <rect x="28.5" y="22" width="3" height="15" rx="1.5" fill="rgba(255,230,100,0.9)"/>
        <path d="M27.5 22 C27.5 22 25 18 27 15 C28.5 13 31.5 13 33 15 C35 18 32.5 22 32.5 22Z"
          fill="rgba(255,170,30,0.9)"/>
        <path d="M29 17 C29 17 27.5 15 29.5 13.5 C31 12.5 32 14 30.5 17Z"
          fill="rgba(255,255,150,0.9)"/>
        {/* Laurels */}
        <path d="M18 34 C18 31 21 30 22 32 C21 35 18 36 18 34Z" fill="rgba(255,200,50,0.85)"/>
        <path d="M16 38 C16 35 19 35 20 37 C19 40 16 40 16 38Z" fill="rgba(255,200,50,0.85)"/>
        <path d="M17 42 C17 39 20 39 21 41 C20 44 17 44 17 42Z" fill="rgba(255,200,50,0.85)"/>
        <path d="M42 34 C42 31 39 30 38 32 C39 35 42 36 42 34Z" fill="rgba(255,200,50,0.85)"/>
        <path d="M44 38 C44 35 41 35 40 37 C41 40 44 40 44 38Z" fill="rgba(255,200,50,0.85)"/>
        <path d="M43 42 C43 39 40 39 39 41 C40 44 43 44 43 42Z" fill="rgba(255,200,50,0.85)"/>
        {/* Filigree bottom */}
        <path d="M23 46 Q30 50 37 46" stroke="rgba(255,190,40,0.7)" strokeWidth="1" fill="none"/>
        <path d="M21 44 Q30 49 39 44" stroke="rgba(255,190,40,0.5)" strokeWidth="0.8" fill="none"/>
      </svg>
    ),
  },
];

function Stand({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center mt-1">
      {/* Velvet cushion holder */}
      <div
        style={{
          width: '72px',
          height: '14px',
          background: 'linear-gradient(180deg, #2A1A2E 0%, #1A0E20 100%)',
          borderRadius: '4px 4px 0 0',
          boxShadow: `0 -2px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.04)`,
          border: `1px solid rgba(80,40,80,0.5)`,
        }}
      />
      {/* Iron post */}
      <div
        style={{
          width: '10px',
          height: '32px',
          background: 'linear-gradient(90deg, #3A3A3A 0%, #5A5A5A 40%, #3A3A3A 100%)',
          boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.08), inset -1px 0 2px rgba(0,0,0,0.4)',
        }}
      />
      {/* Base plate */}
      <div
        style={{
          width: '56px',
          height: '8px',
          background: 'linear-gradient(180deg, #5A5A5A 0%, #2A2A2A 100%)',
          borderRadius: '0 0 3px 3px',
          boxShadow: '0 3px 8px rgba(0,0,0,0.6)',
        }}
      />
    </div>
  );
}

export default function BadgeProgression() {
  return (
    <section className="py-16 px-4 overflow-x-auto"
      style={{ background: 'linear-gradient(180deg, #0A0706 0%, #120D08 50%, #0A0706 100%)' }}>

      <div className="max-w-editorial mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-sans font-bold tracking-[0.22em] uppercase text-brand-fire mb-3">
            Steakakademie · Zertifizierungsstufen
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light">
            Fünf Stufen zur Meisterschaft
          </h2>
        </div>

        {/* Badge row */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 lg:gap-10 min-w-max mx-auto pb-4">
          {BADGES.map((badge, i) => {
            const size = badge.isMaster ? 168 : 136 + i * 6;
            const ringWidth = badge.isMaster ? 10 : 7 + i;

            return (
              <div key={badge.id} className="flex flex-col items-center">

                {/* Medal + aura wrapper */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: size + 32,
                    height: size + 32,
                    filter: `drop-shadow(0 0 ${12 + i * 4}px ${badge.textColor}44)`,
                  }}
                >
                  {/* Outer metallic ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      margin: '12px',
                      background: badge.ringGradient,
                      boxShadow: badge.aura,
                    }}
                  />

                  {/* Medal body */}
                  <div
                    className="absolute rounded-full flex items-center justify-center"
                    style={{
                      margin: `${12 + ringWidth}px`,
                      inset: 0,
                      background: badge.medalGradient,
                    }}
                  >
                    {/* Shine overlay */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ background: badge.shine }}
                    />

                    {/* Inner decorative ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        margin: '6px',
                        border: `1px solid rgba(255,255,255,0.12)`,
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
                      }}
                    />

                    {/* Crest */}
                    <div className="relative z-10 flex items-center justify-center">
                      {badge.crest}
                    </div>
                  </div>
                </div>

                {/* Stand */}
                <Stand color={badge.textColor} />

                {/* Labels */}
                <div className="text-center mt-4 space-y-1">
                  <p
                    className="text-[9px] font-sans font-bold tracking-[0.2em] uppercase"
                    style={{ color: badge.textColor + 'AA' }}
                  >
                    {badge.stufe}
                  </p>
                  <p
                    className="font-serif font-bold leading-tight"
                    style={{
                      fontSize: badge.isMaster ? '13px' : '11px',
                      color: badge.textColor,
                      maxWidth: badge.isMaster ? '140px' : '110px',
                    }}
                  >
                    {badge.name}
                  </p>
                  <p
                    className="text-[9px] font-sans font-bold tracking-[0.16em] uppercase"
                    style={{
                      color: 'rgba(200,136,42,0.5)',
                      letterSpacing: '0.14em',
                    }}
                  >
                    {badge.cert}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connecting line beneath badges */}
        <div className="flex items-center justify-center gap-0 mt-10 px-4">
          <div className="h-px flex-1 max-w-xl"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(200,136,42,0.25), rgba(200,136,42,0.5), rgba(200,136,42,0.25), transparent)' }}
          />
        </div>
      </div>
    </section>
  );
}
