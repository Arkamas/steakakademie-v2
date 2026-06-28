import type { ReactNode } from 'react';
import { Zap, AlertTriangle, Lightbulb, Thermometer } from 'lucide-react';

/**
 * Wiederverwendbare MDX-Callouts gegen „Textwüsten".
 * In MDX: <Schnelluebersicht>…</Schnelluebersicht>, <Achtung>…</Achtung>,
 * <ProTipp>…</ProTipp>, <TempBox>…</TempBox>
 */

function Box({
  icon, label, accent, children,
}: { icon: ReactNode; label: string; accent: string; children: ReactNode }) {
  return (
    <aside
      className="not-prose my-7 border-l-[3px] pl-5 pr-5 py-4 rounded-r-sm"
      style={{ borderLeftColor: accent, background: `${accent}0F` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: accent }} className="shrink-0">{icon}</span>
        <span className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: accent }}>
          {label}
        </span>
      </div>
      <div
        className="callout-body font-body text-[0.95rem] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5"
        style={{ color: 'var(--callout-text)' }}
      >
        {children}
      </div>
    </aside>
  );
}

export function Schnelluebersicht({ children }: { children: ReactNode }) {
  return <Box icon={<Zap size={15} />} label="Schnell-Überblick" accent="#C8882A">{children}</Box>;
}

export function Achtung({ children }: { children: ReactNode }) {
  return <Box icon={<AlertTriangle size={15} />} label="Häufiger Fehler" accent="#E85018">{children}</Box>;
}

export function ProTipp({ children }: { children: ReactNode }) {
  return <Box icon={<Lightbulb size={15} />} label="Profi-Tipp" accent="#C8882A">{children}</Box>;
}

export function TempBox({ children }: { children: ReactNode }) {
  return <Box icon={<Thermometer size={15} />} label="Kerntemperatur" accent="#