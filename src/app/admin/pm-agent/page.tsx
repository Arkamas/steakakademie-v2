'use client'
import { useState, useEffect, useRef } from 'react'
import { PROJECT_STATUS } from '@/lib/pm-agent-context'

type Message = { role: 'user' | 'assistant'; content: string }

function ScoreBar({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail?: string
}) {
  const color =
    value >= 60 ? '#4ade80' : value >= 35 ? '#d4a53a' : '#c8621a'
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs font-mono text-[#8a7e6a] mb-1 gap-3">
        <span>{label}</span>
        <span className="shrink-0" style={{ color }}>
          {value}%{detail ? <span className="text-[#8a7e6a]"> · {detail}</span> : null}
        </span>
      </div>
      <div className="h-1 bg-[#2a2416] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

async function streamText(
  messages: Message[],
  onChunk: (text: string) => void
) {
  const res = await fetch('/api/pm-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok || !res.body) throw new Error('Stream-Fehler')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

export default function PmAgentPage() {
  const [briefing, setBriefing] = useState('')
  const [briefingLoading, setBriefingLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadBriefing() {
      setBriefingLoading(true)
      let text = ''
      try {
        await streamText(
          [
            {
              role: 'user',
              content:
                'Gib mir ein strategisches Chef-Briefing für heute. Was ist der aktuelle Stand, was ist JETZT am wichtigsten, und was ist der eine Schritt der heute passieren muss?',
            },
          ],
          (chunk) => {
            text += chunk
            setBriefing(text)
          }
        )
      } catch {
        setBriefing('Briefing konnte nicht geladen werden. API-Key prüfen.')
      }
      setBriefingLoading(false)
    }
    loadBriefing()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || chatLoading) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setChatLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMsg])

    try {
      await streamText(newMessages, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Fehler — API-Key prüfen.',
        }
        return updated
      })
    }
    setChatLoading(false)
  }

  // null, solange nicht alle Bereiche gemessen werden. Dann zeigt die Kachel
  // ausdrücklich "nicht ermittelbar" statt einer erfundenen Zahl.
  const score = PROJECT_STATUS.readinessScore
  const scoreColor =
    score === null
      ? '#8a7e6a'
      : score >= 60
        ? '#4ade80'
        : score >= 35
          ? '#d4a53a'
          : '#c8621a'
  const bereicheGesamt =
    PROJECT_STATUS.bereiche.length + PROJECT_STATUS.nichtGemessen.length

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#e8dcc8] font-mono p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-[#c8621a] text-xs tracking-widest">
          🥩 STEAKAKADEMIE · PM-AGENT
          <a href="/admin/review" className="ml-4 text-[#8a7e6a] hover:text-[#d4a53a]">▸ REVIEW</a>
        </div>
        <div className="text-[#8a7e6a] text-xs">
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Chef Briefing */}
      <div className="bg-[#16130a] border border-[#2a2416] p-5 mb-6 relative">
        <div className="text-[#d4a53a] text-xs tracking-widest mb-3">
          ▸ TAGES-BRIEFING
        </div>
        {briefingLoading && !briefing ? (
          <div className="text-[#8a7e6a] text-sm animate-pulse motion-reduce:animate-none">
            Analysiere Projektstatus...
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#e8dcc8]">
            {briefing}
            {briefingLoading && (
              <span className="inline-block w-1 h-3 bg-[#c8621a] ml-1 animate-pulse motion-reduce:animate-none" />
            )}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Status */}
        <div className="space-y-4">
          {/* Readiness Score */}
          <div className="bg-[#16130a] border border-[#2a2416] p-5">
            <div className="text-[#d4a53a] text-xs tracking-widest mb-4">
              ▸ VERKAUFSFÄHIGKEIT
            </div>
            {score === null ? (
              <div className="mb-5">
                <div className="text-2xl font-bold text-[#8a7e6a] mb-2">
                  nicht ermittelbar
                </div>
                <div className="text-[#8a7e6a] text-xs leading-relaxed">
                  Erst {PROJECT_STATUS.bereiche.length} von {bereicheGesamt} Bereichen
                  werden gemessen. Eine Gesamtzahl wäre geraten — siehe{' '}
                  <span className="text-[#d4a53a]">docs/pm-status-generator.md</span>.
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-3 mb-4">
                  <div className="text-5xl font-bold" style={{ color: scoreColor }}>
                    {score}%
                  </div>
                  <div className="text-[#8a7e6a] text-xs pb-2">
                    Ziel: 80%
                    <br />
                    Delta: {80 - score}%
                  </div>
                </div>
                <div className="h-2 bg-[#2a2416] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${score}%`, backgroundColor: scoreColor }}
                  />
                </div>
                <div className="text-[#8a7e6a] text-xs mb-5">
                  {PROJECT_STATUS.erfuelltGesamt} von {PROJECT_STATUS.pruefbarGesamt}{' '}
                  prüfbaren Kriterien erfüllt
                  {PROJECT_STATUS.nichtMessbarGesamt
                    ? ` · ${PROJECT_STATUS.nichtMessbarGesamt} nicht messbar`
                    : ''}
                </div>
              </>
            )}
            <div className="space-y-2">
              {PROJECT_STATUS.bereiche.map((b) =>
                // score === null heißt "kein Kriterium war prüfbar". Als 0%-Balken
                // wäre das die alte Verwechslung von "nicht gemessen" mit "nichts fertig".
                b.score === null ? (
                  <div
                    key={b.name}
                    className="flex justify-between text-xs font-mono text-[#8a7e6a] mb-2 gap-3"
                  >
                    <span>{b.name}</span>
                    <span className="shrink-0">nicht messbar</span>
                  </div>
                ) : (
                  <ScoreBar
                    key={b.name}
                    label={b.name}
                    value={b.score}
                    // nichtMessbar mit anzeigen: sonst sähe "100% (2/2)" bei
                    // zehn übersprungenen Prüfungen nach Vollständigkeit aus.
                    detail={
                      `${b.erfuellt}/${b.pruefbar}` +
                      (b.nichtMessbar ? ` · ${b.nichtMessbar} n. m.` : '')
                    }
                  />
                ),
              )}
            </div>
            {PROJECT_STATUS.nichtGemessen.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#2a2416]">
                <div className="text-[#8a7e6a] text-xs tracking-widest mb-2">
                  NICHT GEMESSEN ({PROJECT_STATUS.nichtGemessen.length})
                </div>
                <ul className="space-y-1.5">
                  {PROJECT_STATUS.nichtGemessen.map((n) => (
                    <li key={n.name} className="text-xs text-[#8a7e6a] leading-snug">
                      <span className="text-[#e8dcc8]">{n.name}</span> — {n.grund}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Critical Blockers */}
          <div className="bg-[#16130a] border border-[#c8621a]/30 p-5">
            <div className="text-[#c8621a] text-xs tracking-widest mb-3">
              ▸ KRITISCHE BLOCKER
            </div>
            <ul className="space-y-2">
              {PROJECT_STATUS.critical.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#e8dcc8]">
                  <span className="text-[#c8621a] shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Offene Kriterien — geprüft, nicht erfüllt. Ersetzt die frühere,
              handgepflegte "Nächste Schritte"-Liste: die Reihenfolge steckt
              jetzt in den Blockern oben, die Substanz in geprüften Fakten. */}
          <div className="bg-[#16130a] border border-[#2a2416] p-5">
            <div className="text-[#d4a53a] text-xs tracking-widest mb-3">
              ▸ OFFEN ({PROJECT_STATUS.open.length}) · geprüft
            </div>
            <ul className="space-y-2">
              {PROJECT_STATUS.open.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#e8dcc8]">
                  <span className="text-[#d4a53a] shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-[#2a2416] text-[#8a7e6a] text-xs">
              Gemessen am{' '}
              {new Date(PROJECT_STATUS.generatedAt).toLocaleString('de-DE')}
              {PROJECT_STATUS.offline ? ' · ohne Netzprüfungen' : ''} ·{' '}
              <span className="text-[#d4a53a]">npm run pm:context</span>
            </div>
          </div>
        </div>

        {/* Right: Chat */}
        <div className="bg-[#16130a] border border-[#2a2416] flex flex-col h-[600px]">
          <div className="text-[#d4a53a] text-xs tracking-widest p-4 border-b border-[#2a2416]">
            ▸ CHAT MIT PM-AGENT
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-[#8a7e6a] text-xs">
                Frag den Agent — Strategie, Prioritäten, nächster Schritt...
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-[#d4a53a] text-right'
                    : 'text-[#e8dcc8]'
                }`}
              >
                {msg.role === 'user' ? (
                  <span className="bg-[#2a2416] px-3 py-2 inline-block max-w-[85%]">
                    {msg.content}
                  </span>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                    {chatLoading && i === messages.length - 1 && (
                      <span className="inline-block w-1 h-3 bg-[#c8621a] ml-1 animate-pulse motion-reduce:animate-none" />
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#2a2416] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Frage stellen..."
              className="flex-1 bg-[#0a0805] border border-[#2a2416] text-[#e8dcc8]
                         text-xs p-3 focus:border-[#c8621a] transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !input.trim()}
              className="bg-[#c8621a] text-white text-xs px-4 py-2 tracking-widest
                         hover:bg-[#d97422] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-[#8a7e6a] text-xs">
        PM-Agent v1.0 · Nur du siehst diese Seite
      </div>
    </div>
  )
}
