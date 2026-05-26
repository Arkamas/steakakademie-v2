'use client';

import { useState } from 'react';
import {
  User, FileText, Bell, Shield, Camera,
  Plus, Trash2, ChevronRight, ChevronDown,
} from 'lucide-react';
import { z } from 'zod';
import {
  FloatingLabelInput,
  FloatingLabelTextarea,
  FloatingLabelSelect,
} from '@/components/ui/FloatingLabel';

// ─── Types & Schemas ─────────────────────────────────────────────────────────

type Section = 'profil' | 'rezept' | 'benachrichtigungen' | 'datenschutz';
type FieldErrors = Partial<Record<string, string>>;

const EINHEITEN = ['g', 'kg', 'ml', 'l', 'EL', 'TL', 'Stück', 'Bund', 'Prise', 'Msp.'] as const;

const ProfilSchema = z.object({
  vorname:      z.string().min(1,  { message: 'Ein Name, bitte — auch der kürzeste verdient Respekt.' }),
  nachname:     z.string().min(1,  { message: 'Familienname ist Pflicht.' }),
  anzeigename:  z.string().min(3,  { message: 'Mindestens 3 Zeichen für deinen Auftritt.' })
                          .max(30, { message: 'Maximal 30 Zeichen — Qualität statt Quantität.' }),
  bio:          z.string().max(200, { message: 'Destilliere dich auf 200 Zeichen.' }),
  website:      z.string().url({ message: 'Eine gültige URL, bitte.' }).or(z.literal('')),
  standort:     z.string().max(60, { message: 'Maximal 60 Zeichen.' }),
});

const RezeptSchema = z.object({
  titel:            z.string().min(3,  { message: 'Jedes Meisterwerk braucht einen würdigen Titel.' })
                              .max(70, { message: 'Ein Titel ist kein Aufsatz — maximal 70 Zeichen.' }),
  beschreibung:     z.string().min(20, { message: 'Verführe uns mit mehr als 20 Zeichen.' })
                              .max(200, { message: 'Die Essenz in 200 Zeichen — nicht mehr.' }),
  kategorie:        z.string().min(1,  { message: 'Wähle eine Kategorie.' }),
  schwierigkeit:    z.string().min(1,  { message: 'Wie anspruchsvoll ist dieses Rezept?' }),
  portionen:        z.string().min(1,  { message: 'Für wie viele Seelen kochst du?' }),
  zubereitungszeit: z.string().min(1,  { message: 'Zeit ist Respekt — wie lange dauert es?' }),
  zutaten: z.array(z.object({
    menge:   z.string().min(1, { message: 'Menge fehlt.' }),
    einheit: z.string().min(1),
    name:    z.string().min(2, { message: 'Name zu kurz.' }),
  })).min(1, { message: 'Ein Rezept ohne Zutaten ist eine Fantasie, kein Gericht.' }),
  schritte: z.array(z.object({
    text: z.string().min(10, { message: 'Substanz fehlt — mindestens 10 Zeichen.' }),
  })).min(1, { message: 'Mindestens ein Schritt ist Pflicht.' }),
});

// ─── Static Options ──────────────────────────────────────────────────────────

const KATEGORIEN = [
  { value: 'fleisch',      label: 'Fleisch' },
  { value: 'beilagen',     label: 'Beilagen & Salate' },
  { value: 'saucen-rubs',  label: 'Saucen, Rubs & Injektionen' },
  { value: 'desserts',     label: 'Fire Desserts' },
  { value: 'wine-spirits', label: 'Wine, Spirits & Cocktails' },
];

const SCHWIERIGKEITEN = [
  { value: 'Einfach',        label: 'Einfach' },
  { value: 'Mittel',         label: 'Mittel' },
  { value: 'Fortgeschritten', label: 'Fortgeschritten' },
  { value: 'Profi',          label: 'Profi' },
];

const PORTIONEN_OPT = [1,2,3,4,5,6,8,10,12].map(n => ({
  value: String(n),
  label: `${n} Portion${n > 1 ? 'en' : ''}`,
}));

const ZEITEN_OPT = [
  '15 Min.','30 Min.','45 Min.','1 Std.','1,5 Std.','2 Std.',
  '3 Std.','4 Std.','6+ Std.','Overnight',
].map(t => ({ value: t, label: t }));

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; icon: React.ElementType; label: string; sub?: string }[] = [
  { id: 'profil',            icon: User,     label: 'Profil',             sub: 'Öffentliches Profil' },
  { id: 'rezept',            icon: FileText, label: 'Rezept einreichen',  sub: 'Kreation einreichen' },
  { id: 'benachrichtigungen', icon: Bell,    label: 'Benachrichtigungen', sub: 'E-Mail & Push' },
  { id: 'datenschutz',       icon: Shield,   label: 'Datenschutz',        sub: 'Konto & Daten' },
];

// ─── Profile Section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const [data, setData] = useState({
    vorname: '', nachname: '', anzeigename: '', bio: '', website: '', standort: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved]   = useState(false);

  function set<K extends keyof typeof data>(key: K, val: string) {
    setData(d => ({ ...d, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = ProfilSchema.safeParse(data);
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as string;
        if (!fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setData({ vorname: '', nachname: '', anzeigename: '', bio: '', website: '', standort: '' });
    setErrors({});
    setSaved(false);
  }

  return (
    <form id="profil-form" onSubmit={handleSave} noValidate>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-10">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-fire/20 border border-brand-gold/25 flex items-center justify-center shrink-0">
            <span className="font-serif text-2xl font-bold text-brand-gold">M</span>
          </div>
          <button
            type="button"
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Profilbild ändern"
          >
            <Camera size={16} className="text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-body text-text-primary font-semibold">Profilbild</p>
          <p className="text-xs font-sans text-text-muted mt-0.5">
            JPG oder PNG · max. 10 MB
          </p>
          <button
            type="button"
            className="mt-2 text-[10px] font-sans font-bold tracking-[0.12em] uppercase text-brand-gold hover:text-[#b07020] transition-colors"
          >
            Bild hochladen
          </button>
        </div>
      </div>

      {/* Divider label */}
      <SectionDivider label="Persönliche Daten" />

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 mb-7">
        <FloatingLabelInput
          id="vorname"
          label="Vorname"
          value={data.vorname}
          onChange={v => set('vorname', v)}
          autoComplete="given-name"
          error={errors.vorname}
        />
        <FloatingLabelInput
          id="nachname"
          label="Nachname"
          value={data.nachname}
          onChange={v => set('nachname', v)}
          autoComplete="family-name"
          error={errors.nachname}
        />
      </div>

      <div className="mb-7">
        <FloatingLabelInput
          id="anzeigename"
          label="Anzeigename"
          value={data.anzeigename}
          onChange={v => set('anzeigename', v)}
          hint="So erscheinst du auf der Akademie — einzigartig, prägnant."
          error={errors.anzeigename}
        />
      </div>

      <SectionDivider label="Über dich" />

      <div className="mb-7">
        <FloatingLabelTextarea
          id="bio"
          label="Über mich"
          value={data.bio}
          onChange={v => set('bio', v)}
          rows={4}
          maxLength={200}
          placeholder="Wer bist du am Grill? Was treibt dich an?"
          error={errors.bio}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
        <FloatingLabelInput
          id="website"
          label="Website"
          type="url"
          value={data.website}
          onChange={v => set('website', v)}
          placeholder="https://deine-seite.de"
          error={errors.website}
        />
        <FloatingLabelInput
          id="standort"
          label="Standort"
          value={data.standort}
          onChange={v => set('standort', v)}
          placeholder="z. B. Berlin, Deutschland"
          error={errors.standort}
        />
      </div>

      {/* Mobile Save (bottom of form, for small screens) */}
      <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-5 sm:hidden">
        <ResetButton onClick={handleReset} />
        <SaveButton saved={saved} />
      </div>
    </form>
  );
}

// ─── Recipe Section ──────────────────────────────────────────────────────────

function RezeptSection() {
  const [data, setData] = useState({
    titel: '', beschreibung: '', kategorie: '', schwierigkeit: '',
    portionen: '', zubereitungszeit: '',
    zutaten:  [{ menge: '', einheit: 'g', name: '' }],
    schritte: [{ text: '' }],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved]   = useState(false);

  function set<K extends keyof typeof data>(key: K, val: (typeof data)[K]) {
    setData(d => ({ ...d, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setSaved(false);
  }

  function updateZutat(i: number, key: 'menge' | 'einheit' | 'name', val: string) {
    setData(d => {
      const next = [...d.zutaten];
      next[i] = { ...next[i], [key]: val };
      return { ...d, zutaten: next };
    });
    setErrors(e => ({ ...e, [`zutaten.${i}.${key}`]: undefined }));
  }

  function updateSchritt(i: number, val: string) {
    setData(d => {
      const next = [...d.schritte];
      next[i] = { text: val };
      return { ...d, schritte: next };
    });
    setErrors(e => ({ ...e, [`schritte.${i}.text`]: undefined }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = RezeptSchema.safeParse(data);
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const issue of result.error.issues) {
        const k = issue.path.join('.');
        if (!fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setData({
      titel: '', beschreibung: '', kategorie: '', schwierigkeit: '',
      portionen: '', zubereitungszeit: '',
      zutaten:  [{ menge: '', einheit: 'g', name: '' }],
      schritte: [{ text: '' }],
    });
    setErrors({});
    setSaved(false);
  }

  return (
    <form id="profil-form" onSubmit={handleSave} noValidate>

      <SectionDivider label="Grunddaten" />

      {/* Titel */}
      <div className="mb-7">
        <FloatingLabelInput
          id="r-titel"
          label="Rezept-Titel"
          value={data.titel}
          onChange={v => set('titel', v)}
          hint="Prägnant und appetitanregend — max. 70 Zeichen."
          error={errors.titel}
        />
      </div>

      {/* Beschreibung */}
      <div className="mb-7">
        <FloatingLabelTextarea
          id="r-beschr"
          label="Kurzbeschreibung"
          value={data.beschreibung}
          onChange={v => set('beschreibung', v)}
          rows={3}
          maxLength={200}
          placeholder="Was macht dieses Rezept besonders?"
          error={errors.beschreibung}
        />
      </div>

      {/* Kategorie + Schwierigkeit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 mb-7">
        <FloatingLabelSelect
          id="r-kategorie"
          label="Kategorie"
          value={data.kategorie}
          onChange={v => set('kategorie', v)}
          options={KATEGORIEN}
          error={errors.kategorie}
        />
        <FloatingLabelSelect
          id="r-schwier"
          label="Schwierigkeit"
          value={data.schwierigkeit}
          onChange={v => set('schwierigkeit', v)}
          options={SCHWIERIGKEITEN}
          error={errors.schwierigkeit}
        />
      </div>

      {/* Portionen + Zeit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
        <FloatingLabelSelect
          id="r-port"
          label="Portionen"
          value={data.portionen}
          onChange={v => set('portionen', v)}
          options={PORTIONEN_OPT}
          error={errors.portionen}
        />
        <FloatingLabelSelect
          id="r-zeit"
          label="Zubereitungszeit"
          value={data.zubereitungszeit}
          onChange={v => set('zubereitungszeit', v)}
          options={ZEITEN_OPT}
          error={errors.zubereitungszeit}
        />
      </div>

      {/* ── Zutaten ── */}
      <SectionDivider label="Zutaten" />

      {/* Spaltenheader */}
      <div className="grid grid-cols-[80px_108px_1fr_28px] gap-x-3 mb-2">
        {['Menge','Einheit','Zutat',''].map(h => (
          <span key={h} className="text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-text-muted">{h}</span>
        ))}
      </div>

      <div className="space-y-3">
        {data.zutaten.map((z, i) => (
          <div key={i} className="grid grid-cols-[80px_108px_1fr_28px] gap-x-3 items-start">
            {/* Menge */}
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={z.menge}
                onChange={e => updateZutat(i, 'menge', e.target.value)}
                placeholder="500"
                className={zutatInputCls(!!errors[`zutaten.${i}.menge`])}
              />
              {errors[`zutaten.${i}.menge`] && (
                <p className="mt-1 text-xs font-sans text-brand-fire">{errors[`zutaten.${i}.menge`]}</p>
              )}
            </div>

            {/* Einheit */}
            <div className="relative">
              <select
                value={z.einheit}
                onChange={e => updateZutat(i, 'einheit', e.target.value)}
                className={zutatInputCls(false) + ' appearance-none pr-7 cursor-pointer bg-surface-base'}
              >
                {EINHEITEN.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>

            {/* Name */}
            <div>
              <input
                type="text"
                value={z.name}
                onChange={e => updateZutat(i, 'name', e.target.value)}
                placeholder="Rinderbrisket Packer Cut"
                className={zutatInputCls(!!errors[`zutaten.${i}.name`])}
              />
              {errors[`zutaten.${i}.name`] && (
                <p className="mt-1 text-xs font-sans text-brand-fire">{errors[`zutaten.${i}.name`]}</p>
              )}
            </div>

            {/* Remove */}
            <div className="flex justify-center pt-3">
              {data.zutaten.length > 1 && (
                <button
                  type="button"
                  onClick={() => setData(d => ({ ...d, zutaten: d.zutaten.filter((_, j) => j !== i) }))}
                  className="text-text-muted hover:text-brand-fire transition-colors"
                  aria-label="Zutat entfernen"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}

        {errors.zutaten && <p className="text-xs font-sans text-brand-fire">{errors.zutaten}</p>}
      </div>

      <button
        type="button"
        onClick={() => setData(d => ({ ...d, zutaten: [...d.zutaten, { menge: '', einheit: 'g', name: '' }] }))}
        className="flex items-center gap-1.5 mt-4 text-xs font-sans font-bold text-brand-gold hover:text-[#b07020] transition-colors tracking-[0.12em] uppercase"
      >
        <Plus size={13} />
        Zutat hinzufügen
      </button>

      {/* ── Schritte ── */}
      <SectionDivider label="Zubereitungsschritte" />

      <div className="space-y-5">
        {data.schritte.map((s, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-text-muted">
                Schritt {i + 1}
              </span>
              {data.schritte.length > 1 && (
                <button
                  type="button"
                  onClick={() => setData(d => ({ ...d, schritte: d.schritte.filter((_, j) => j !== i) }))}
                  className="text-text-muted hover:text-brand-fire transition-colors"
                  aria-label={`Schritt ${i + 1} entfernen`}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <FloatingLabelTextarea
              id={`r-schritt-${i}`}
              label={`Schritt ${i + 1}`}
              value={s.text}
              onChange={v => updateSchritt(i, v)}
              rows={3}
              placeholder={`Beschreibe Schritt ${i + 1} präzise — Temperatur, Zeit, Technik.`}
              error={errors[`schritte.${i}.text`]}
            />
          </div>
        ))}

        {errors.schritte && <p className="text-xs font-sans text-brand-fire">{errors.schritte}</p>}
      </div>

      <button
        type="button"
        onClick={() => setData(d => ({ ...d, schritte: [...d.schritte, { text: '' }] }))}
        className="flex items-center gap-1.5 mt-4 text-xs font-sans font-bold text-brand-gold hover:text-[#b07020] transition-colors tracking-[0.12em] uppercase"
      >
        <Plus size={13} />
        Schritt hinzufügen
      </button>

      {/* Mobile buttons */}
      <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-5 sm:hidden">
        <ResetButton onClick={handleReset} />
        <SaveButton saved={saved} />
      </div>
    </form>
  );
}

// ─── Placeholder Section ──────────────────────────────────────────────────────

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 border border-border-subtle flex items-center justify-center mb-4">
        <Shield size={18} className="text-text-muted" />
      </div>
      <p className="font-serif text-lg font-bold text-text-primary mb-2">{title}</p>
      <p className="text-sm font-body text-text-muted max-w-xs">
        Dieser Bereich wird nach der Konto-Aktivierung freigeschaltet.
      </p>
    </div>
  );
}

// ─── Shared Small Components ──────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-7 mt-2">
      <div className="h-px flex-1 bg-border-subtle" />
      <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-gold/70 shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-sans tracking-[0.12em] uppercase text-text-muted hover:text-text-secondary transition-colors pb-px border-b border-transparent hover:border-text-muted/40"
    >
      Zurücksetzen
    </button>
  );
}

function SaveButton({ saved }: { saved: boolean }) {
  return (
    <button
      form="profil-form"
      type="submit"
      className="bg-brand-gold hover:bg-[#b07020] active:bg-[#9a6010] text-ink font-sans font-bold text-xs tracking-[0.14em] uppercase px-8 py-3 transition-colors"
    >
      {saved ? 'Gespeichert ✓' : 'Speichern'}
    </button>
  );
}

function zutatInputCls(hasError: boolean) {
  return (
    'w-full bg-transparent px-3 py-3 text-sm font-body text-text-primary border ' +
    'focus:outline-none transition-colors duration-150 ' +
    (hasError
      ? 'border-brand-fire'
      : 'border-border-subtle hover:border-text-muted/60 focus:border-brand-gold')
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const [active, setActive] = useState<Section>('profil');

  const currentSection = NAV_ITEMS.find(n => n.id === active)!;

  function handleFormSave() {
    const form = document.getElementById('profil-form') as HTMLFormElement | null;
    form?.requestSubmit();
  }

  function handleFormReset() {
    const form = document.getElementById('profil-form') as HTMLFormElement | null;
    form?.reset();
  }

  return (
    <div className="flex min-h-screen bg-surface-base">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden sm:flex sm:flex-col w-52 lg:w-60 shrink-0 border-r border-border-subtle">
        <div className="sticky top-0 h-screen overflow-y-auto flex flex-col py-8 px-4">

          {/* Account head */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-gold/25 to-brand-fire/15 border border-brand-gold/20 flex items-center justify-center shrink-0">
              <span className="font-serif text-sm font-bold text-brand-gold">M</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sans font-bold text-text-primary truncate">Marco</p>
              <p className="text-[10px] font-sans text-text-muted truncate">Akademie-Autor</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1">
            <p className="px-2 mb-2 text-[9px] font-sans font-bold tracking-[0.2em] uppercase text-text-muted/60">
              Konto
            </p>
            <ul className="space-y-0.5">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActive(item.id)}
                      className={[
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                        'transition-colors duration-150 group',
                        isActive
                          ? 'text-brand-gold bg-brand-gold/6 border-l-2 border-brand-gold'
                          : 'text-text-muted hover:text-text-secondary hover:bg-surface-card border-l-2 border-transparent',
                      ].join(' ')}
                    >
                      <Icon
                        size={14}
                        className={isActive ? 'text-brand-gold shrink-0' : 'shrink-0 group-hover:text-text-secondary'}
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-sans font-bold ${isActive ? 'text-brand-gold' : ''}`}>
                          {item.label}
                        </p>
                        {item.sub && (
                          <p className="text-[10px] font-sans text-text-muted/70 truncate">{item.sub}</p>
                        )}
                      </div>
                      {isActive && (
                        <ChevronRight size={11} className="ml-auto text-brand-gold/60 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer note */}
          <p className="px-2 mt-6 text-[10px] font-sans text-text-muted/50 leading-relaxed">
            Daten werden verschlüsselt<br />gespeichert.
          </p>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Page header */}
        <div className="border-b border-border-subtle px-6 sm:px-10 py-5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-sans font-bold tracking-[0.2em] uppercase text-brand-fire mb-0.5">
              Steakakademie
            </p>
            <h1 className="font-serif text-xl font-bold text-text-primary">
              {currentSection.label}
            </h1>
          </div>

          {/* Mobile nav selector */}
          <div className="sm:hidden relative">
            <select
              value={active}
              onChange={e => setActive(e.target.value as Section)}
              className="text-xs font-sans font-bold text-text-primary bg-surface-elevated border border-border-subtle px-3 py-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-brand-gold"
            >
              {NAV_ITEMS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 pb-28">
          <div className="max-w-2xl">
            {active === 'profil'            && <ProfileSection />}
            {active === 'rezept'            && <RezeptSection />}
            {active === 'benachrichtigungen' && <PlaceholderSection title="Benachrichtigungen" />}
            {active === 'datenschutz'       && <PlaceholderSection title="Datenschutz" />}
          </div>
        </div>

        {/* ── Fixed action bar ──────────────────────────────────────────── */}
        <div className="hidden sm:flex fixed bottom-0 left-52 lg:left-60 right-0 z-40 items-center justify-between px-10 py-4 border-t border-border-subtle bg-surface-base/95 backdrop-blur-sm">
          {/* Left: hint */}
          <p className="text-[10px] font-sans text-text-muted/60">
            Änderungen werden erst nach dem Speichern wirksam.
          </p>
          {/* Right: buttons */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={handleFormReset}
              className="text-xs font-sans tracking-[0.12em] uppercase text-text-muted hover:text-text-secondary transition-colors pb-px border-b border-transparent hover:border-text-muted/40"
            >
              Zurücksetzen
            </button>
            <button
              type="button"
              onClick={handleFormSave}
              className="bg-brand-gold hover:bg-[#b07020] active:bg-[#9a6010] text-ink font-sans font-bold text-xs tracking-[0.14em] uppercase px-8 py-3 transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
