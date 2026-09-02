/**
 * CurrentRoom — the shared "dark room" every Current lives in.
 *
 * One structure, five hues. The room takes its colour from the current's field
 * hue (see currentField.ts) so Money, Self, Energy, Relationships and Health
 * are the same room lit differently — never five different designs.
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import type { DomainConfig } from '@/lib/domains';
import { useFieldTint } from '@/lib/currentField';
import CurrentGlyph from '@/components/CurrentGlyph';
import { useAppState } from '@/lib/AppContext';
import type { EmotionalState } from '@/lib/types';
import { rise, stagger } from '@/lib/motion';

export interface RoomTool {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
}

export interface RoomSection {
  title: string;
  time: string;
  tools: RoomTool[];
  /** full-width rows instead of a 2-up grid */
  deep?: boolean;
}

export interface RoomRecommendation {
  label: string;
  line: string;
  cta: string;
  meta: string;
  to: string;
}

export interface RoomConfig {
  sections: RoomSection[];
  recommendations: Partial<Record<EmotionalState, RoomRecommendation>>;
  fallback: RoomRecommendation;
}

const FIELD = 'var(--field-h) var(--field-s)';
const accent = `hsl(${FIELD} 62%)`;

export default function CurrentRoom({ domain, room }: { domain: DomainConfig; room: RoomConfig }) {
  const navigate = useNavigate();
  useFieldTint(domain.key);

  const { state } = useAppState();
  const latestState = state.checkIns[0]?.state;
  const recommendation = useMemo(
    () => (latestState && room.recommendations[latestState]) || room.fallback,
    [latestState, room]
  );

  const toolsId = `${domain.key}-tools`;

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, hsl(${FIELD} 58% / 0.10), transparent 70%)` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-7 safe-top">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={() => navigate('/currents')}
            className="press flex min-h-[44px] items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-sm">Currents</span>
          </button>
          <button
            onClick={() => navigate(`${domain.route}/state`)}
            aria-label={`Update your ${domain.label.toLowerCase()} state`}
            className="press relative grid h-11 w-11 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--muted)),hsl(var(--card))_60%,hsl(var(--background))_100%)]"
            style={{ boxShadow: `0 0 18px hsl(${FIELD} 58% / 0.20)` }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
            />
            <span className="absolute -bottom-3 right-0 font-heading text-[11px] italic text-muted-foreground/70">
              {recommendation.label}
            </span>
          </button>
        </div>

        <header className="space-y-3 pt-2 text-center">
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
            style={{
              background: `hsl(${FIELD} 58% / 0.10)`,
              borderColor: `hsl(${FIELD} 58% / 0.22)`,
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span style={{ color: accent }} className="inline-flex">
              <CurrentGlyph current={domain.key} size={30} />
            </span>
          </motion.div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {domain.label}
          </h1>
          <p className="mx-auto max-w-[300px] font-heading text-base italic leading-relaxed text-muted-foreground">
            {domain.tagline}
          </p>
        </header>

        {/* State-aware opening move */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[1.125rem] border p-5"
          style={{
            borderColor: `hsl(${FIELD} 58% / 0.22)`,
            background: `hsl(${FIELD} 58% / 0.10)`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-2xl"
            style={{ background: `hsl(${FIELD} 58% / 0.16)` }}
            aria-hidden="true"
          />
          <div className="relative space-y-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: accent }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
              For where you are
            </p>
            <p className="font-heading text-lg italic leading-relaxed text-foreground">{recommendation.line}</p>
            <button
              onClick={() => navigate(recommendation.to)}
              className="press group flex w-full items-center justify-between rounded-xl border border-border/30 bg-background/35 px-4 py-3.5 text-left transition-colors hover:bg-background/50"
            >
              <span>
                <span className="block font-heading text-lg font-medium text-foreground">{recommendation.cta}</span>
                <span className="mt-0.5 block text-[11px] tracking-wide text-muted-foreground/70">{recommendation.meta}</span>
              </span>
              <ChevronRight size={16} style={{ color: accent }} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => document.getElementById(toolsId)?.scrollIntoView({ behavior: 'smooth' })}
              className="mx-auto block min-h-[44px] text-xs text-muted-foreground/70 underline underline-offset-4"
            >
              Or pick something else below
            </button>
          </div>
        </motion.section>

        <div id={toolsId} className="scroll-mt-6 space-y-7">
          {room.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="font-heading text-lg font-medium italic text-foreground">{section.title}</h2>
                <p className="text-[11px] lowercase tracking-wide text-muted-foreground/70">{section.time}</p>
              </div>

              <motion.div
                variants={stagger()}
                initial="hidden"
                animate="show"
                className={section.deep ? 'grid gap-2.5' : 'grid grid-cols-2 gap-2.5'}
              >
                {section.tools.map(({ icon: Icon, title, description, to }) => (
                  <motion.button
                    key={title}
                    variants={rise}
                    onClick={() => navigate(to)}
                    className={`press soul-glass-elevated flex min-h-[64px] w-full rounded-2xl p-4 text-left transition-colors hover:bg-muted/10 ${
                      section.deep ? 'items-center gap-4' : 'flex-col gap-2'
                    }`}
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ background: `hsl(${FIELD} 58% / 0.12)` }}
                    >
                      <Icon size={18} strokeWidth={1.5} style={{ color: accent }} aria-hidden="true" />
                    </span>
                    <span className="flex-1 space-y-1">
                      <span className="block font-heading text-base font-medium tracking-tight text-foreground">{title}</span>
                      <span className="block text-xs leading-relaxed text-muted-foreground">{description}</span>
                    </span>
                    {section.deep && (
                      <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" aria-hidden="true" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
