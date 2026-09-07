'use client';

import { useEffect, useRef } from 'react';

/**
 * Die Glut-Animation — das einzige bewegte Element der Website, erlaubt
 * AUSSCHLIESSLICH im Hero der Startseite (Handoff-README, „Die Glut-Animation").
 *
 * Stufe „Ruhig" ist die Vorgabe; „Lebendig" existiert nur als Prop und ist
 * nirgends eingeschaltet.
 *
 * Die vier Perf-Regeln aus der Messung — alle nötig, bei 5 fps war die Seite
 * unbenutzbar:
 *  1. Farbverläufe einmal bauen, neu nur bei geänderter Canvas-Breite.
 *  2. Kein shadowBlur pro Partikel — Schein aus einer 32×32-Sprite per drawImage.
 *  3. Nur zeichnen, wenn sichtbar (IntersectionObserver, rootMargin 120px).
 *  4. ~30 fps (now - last < 32 → return), Canvas-Breite auf 900px gedeckelt.
 *
 * Physik, Farben und Obergrenzen (34 / 90 Funken) sind 1:1 aus dem Prototyp.
 * Die Verläufe wurden dort bereits zweimal auf Wunsch verkleinert — nicht
 * wieder aufdrehen. prefers-reduced-motion: keine Animation.
 */
interface Spark {
  x: number; y: number; vx: number; vy: number; r: number;
  ph: number; sw: number; fk: number; life: number; max: number;
}

export default function EmberCanvas({ level = 'Ruhig' }: { level?: 'Ruhig' | 'Lebendig' }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const lively = level === 'Lebendig';
    const MAXW = 900;

    const st = {
      raf: 0, parts: [] as Spark[], w: 0, h: 0, t: 0, vis: true,
      grad: null as [CanvasGradient, CanvasGradient] | null, gw: 0, last: 0, chk: 0, cssw: 1, scale: 1,
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      st.scale = Math.min(1, MAXW / Math.max(1, r.width));
      st.cssw = Math.max(1, r.width);
      st.w = canvas.width = Math.max(1, Math.round(r.width * st.scale));
      st.h = canvas.height = Math.max(1, Math.round(r.height * st.scale));
      st.grad = null;
    };
    resize();

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((es) => { st.vis = es[es.length - 1].isIntersecting; }, { rootMargin: '120px' });
      io.observe(canvas);
    }

    // Vorgerenderter Funken-Schein statt shadowBlur pro Partikel
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const sg = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      sg.addColorStop(0, 'rgba(255,255,255,1)');
      sg.addColorStop(0.25, 'rgba(255,190,110,.85)');
      sg.addColorStop(1, 'rgba(255,138,61,0)');
      sctx.fillStyle = sg;
      sctx.fillRect(0, 0, 32, 32);
    }

    const spawn = () => {
      const w = st.w, h = st.h;
      // Glutnest unten Mitte, nach außen dünner
      const u = Math.random(), sk = (u + Math.random()) / 2;
      const big = Math.random() < 0.07;
      st.parts.push({
        x: w * (0.08 + sk * 0.84), y: h + 4,
        vx: (Math.random() - .5) * (lively ? .34 : .16),
        vy: -(lively ? (0.55 + Math.random() * 0.85) : (0.28 + Math.random() * 0.42)),
        r: big ? 0.95 + Math.random() * 0.55 : 0.3 + Math.random() * 0.5,
        ph: Math.random() * 628, sw: 0.4 + Math.random() * 1.2,
        fk: 0.55 + Math.random() * 0.45,
        life: 0, max: (lively ? 150 : 260) + Math.random() * (lively ? 190 : 300),
      });
    };

    const draw = (now: number) => {
      st.raf = requestAnimationFrame(draw);
      if (!st.vis) return;
      if (now - st.last < 32) return; // ~30 fps statt jedem Tick
      st.last = now;
      if (++st.chk % 30 === 0 && Math.abs(canvas.getBoundingClientRect().width - st.cssw) > 2) resize();
      const w = st.w, h = st.h;
      st.t += 1;
      ctx.clearRect(0, 0, w, h);
      const motion = !reduce;
      const breathe = motion ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(st.t / 140)) : 0.8;

      if (!st.grad || st.gw !== w) { // Verläufe einmal bauen, nicht pro Bild
        const g = ctx.createRadialGradient(w * .5, h * 1.06, 0, w * .5, h * 1.06, Math.max(w, h) * .46);
        g.addColorStop(0, 'rgba(255,138,61,.52)');
        g.addColorStop(0.35, 'rgba(226,83,31,.24)');
        g.addColorStop(1, 'rgba(21,18,15,0)');
        const g2 = ctx.createLinearGradient(0, h, 0, h * .76);
        g2.addColorStop(0, 'rgba(255,179,92,.32)');
        g2.addColorStop(1, 'rgba(255,179,92,0)');
        st.grad = [g, g2];
        st.gw = w;
      }
      ctx.globalAlpha = breathe;
      ctx.fillStyle = st.grad[0]; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = st.grad[1]; ctx.fillRect(0, h * .76, w, h * .24);
      ctx.globalAlpha = 1;

      if (motion) {
        const cap = lively ? 90 : 34;
        const rate = lively ? 0.7 : 0.22;
        if (st.parts.length < cap && Math.random() < rate) spawn();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = st.parts.length - 1; i >= 0; i--) {
          const p = st.parts[i];
          p.life++;
          const fl = p.life / p.max;
          // Auftrieb sinkt mit der Abkühlung, Luftwiderstand bremst die Seitwärtsdrift
          p.vy = p.vy * 0.995 - 0.0075 * (1 - fl) * (lively ? 1 : 0.6);
          const turb = Math.sin((st.t + p.ph) / 46) * 0.30 * p.sw
                     + Math.sin((st.t + p.ph) / 121) * 0.20
                     + Math.sin((st.t * 0.37 + p.ph) / 17) * 0.07 * p.sw;
          p.vx *= 0.985;
          p.x += p.vx + turb * (lively ? 1 : 0.65);
          p.y += p.vy;
          // Temperatur: kurz weißglühend, dann orange, am Ende tiefrot
          const temp = Math.pow(Math.max(0, 1 - fl), 1.6);
          const fade = Math.min(1, Math.max(0, 1 - fl) * 2.2) * (0.35 + 0.65 * temp);
          const flick = 1 - p.fk * 0.42 * (0.5 + 0.5 * Math.sin((st.t * 1.7 + p.ph) / 3.1));
          const a = Math.min(1, fade * flick) * 0.92;
          const g = Math.round(90 + 145 * temp), b = Math.round(24 + 150 * Math.pow(temp, 3.4));
          const gr = p.r * 3.4;
          ctx.globalAlpha = a * 0.5;
          ctx.drawImage(sprite, p.x - gr, p.y - gr, gr * 2, gr * 2);
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,${g},${b},${a})`;
          ctx.fill();
          if (p.life > p.max || p.y < -12) st.parts.splice(i, 1);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    };

    st.raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(st.raf);
      io?.disconnect();
    };
  }, [level]);

  return <canvas ref={ref} className="sk-hero__canvas" aria-hidden="true" />;
}
