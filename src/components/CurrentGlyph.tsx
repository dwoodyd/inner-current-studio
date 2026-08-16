/**
 * CurrentGlyph — five abstract marks, one per current.
 *
 * Emoji are the most verbal thing available; these are not. Each glyph is a
 * geometry, not a picture: a shape you learn by returning to it. Strokes use
 * currentColor so a glyph takes the color of whatever field it sits in.
 */
import type { DomainKey } from '@/lib/domains';

interface CurrentGlyphProps {
  current: DomainKey;
  size?: number;
  className?: string;
  /** Stroke weight; the glyph reads lighter at large sizes. */
  strokeWidth?: number;
}

const paths: Record<DomainKey, (sw: number) => JSX.Element> = {
  // Money — descending ripples meeting a still point: receiving.
  money: (sw) => (
    <>
      <path d="M8 15c4-4 12-4 16 0" strokeWidth={sw} />
      <path d="M10.5 22c3.2-3.2 9.8-3.2 13 0" strokeWidth={sw} />
      <path d="M13 29c2-2 6-2 8 0" strokeWidth={sw} />
      <circle cx="17" cy="36" r="1.9" strokeWidth={sw} />
    </>
  ),
  // Self — a single ring on its own axis, with a centre that holds.
  self: (sw) => (
    <>
      <circle cx="17" cy="19" r="9.5" strokeWidth={sw} />
      <path d="M17 4.5v29" strokeWidth={sw} />
      <circle cx="17" cy="19" r="2.2" strokeWidth={sw} />
    </>
  ),
  // Energy — a charge folding through an open arc.
  energy: (sw) => (
    <>
      <path d="M26 8a12.5 12.5 0 1 0 4.5 9.5" strokeWidth={sw} />
      <path d="M19 8l-6 11h8l-6 11" strokeWidth={sw} />
    </>
  ),
  // Relationships — two fields overlapping; the space between is the subject.
  relationships: (sw) => (
    <>
      <circle cx="13" cy="19" r="9" strokeWidth={sw} />
      <circle cx="23" cy="19" r="9" strokeWidth={sw} />
      <path d="M18 11.2a9 9 0 0 0 0 15.6" strokeWidth={sw} opacity={0.5} />
    </>
  ),
  // Health — a vessel: an unbroken outer line, an inner line that breathes.
  health: (sw) => (
    <>
      <path d="M18 4.5 30 12v14L18 33.5 6 26V12z" strokeWidth={sw} />
      <path d="M11 19c3.5-4.5 10.5-4.5 14 0" strokeWidth={sw} />
      <path d="M13.5 24.5c2.6-2.6 7.4-2.6 10 0" strokeWidth={sw} opacity={0.55} />
    </>
  ),
};

export default function CurrentGlyph({
  current,
  size = 28,
  className = '',
  strokeWidth = 1.4,
}: CurrentGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 40"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[current](strokeWidth)}
    </svg>
  );
}
