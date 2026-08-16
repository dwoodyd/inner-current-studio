// ResonanceCardExport — renders a shareable card (sigil + landed
// beliefs) into an SVG and triggers a PNG download.
import { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { DOMAINS, type DomainKey } from '@/lib/domains';
import { CURRENT_SPECS } from '@/lib/currents/spec';
import { useCurrentProgress, stageForCount } from '@/lib/currents/progress';

const STAGE_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: 'Seed', 2: 'Sprout', 3: 'Bloom', 4: 'Resonance',
};

// Mirror of CurrentSigil shape logic, but inline so we can serialize to SVG.
function sigilSvg(base: string, stage: 1|2|3|4, color: string) {
  const opacity = 0.55 + stage * 0.1;
  const stroke = color;
  const sw = 1.5 + stage * 0.4;
  switch (base) {
    case 'spiral':
      return `<circle cx="0" cy="0" r="40" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>
        <path d="M0,0 m-30,0 a30,30 0 1,1 0,0.1 a25,25 0 1,1 0,0.2 a20,20 0 1,1 0,0.3" fill="none" stroke="${stroke}" stroke-width="${sw*0.8}" opacity="${opacity*0.9}"/>`;
    case 'concentric':
      return `<circle cx="0" cy="0" r="42" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>
        <circle cx="0" cy="0" r="${22 + stage*4}" fill="none" stroke="${stroke}" stroke-width="${sw*0.9}" opacity="${opacity*0.95}"/>
        ${stage>=3?`<circle cx="0" cy="0" r="8" fill="${stroke}" opacity="${opacity*0.8}"/>`:''}`;
    case 'wave':
      return `<circle cx="0" cy="0" r="40" fill="none" stroke="${stroke}" stroke-width="${sw*0.8}" opacity="${opacity*0.6}"/>
        <path d="M-34,0 Q-22,${-12-stage*2} -10,0 T14,0 T38,0" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
    case 'venn':
      return `<circle cx="-12" cy="0" r="24" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>
        <circle cx="12" cy="0" r="24" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
    case 'leaf':
      return `<path d="M0,-35 Q22,-10 0,30 Q-22,-10 0,-35 Z" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>
        <line x1="0" y1="-35" x2="0" y2="30" stroke="${stroke}" stroke-width="${sw*0.6}" opacity="${opacity*0.7}"/>`;
    default:
      return `<circle cx="0" cy="0" r="40" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
  }
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'} as any)[c]);
}

function buildSvg(slug: DomainKey): string {
  const spec = CURRENT_SPECS[slug];
  const d = DOMAINS[slug];
  const prog = JSON.parse(localStorage.getItem(`iw.currentProgress.${slug}`) || '{}');
  const stage = stageForCount(prog.practicesCompleted ?? 0);
  const beliefIds: string[] = [...(prog.beliefsLandedAsAlive || []), ...(prog.beliefsLandedAsTrue || [])];
  const lines = beliefIds
    .map((id) => spec.beliefs.find((b) => b.id === id)?.endingThought)
    .filter(Boolean)
    .slice(0, 6) as string[];

  const W = 1080, H = 1350;
  const gold = '#c9943a';
  const sigil = sigilSvg(spec.sigilBase, stage, gold);

  const beliefRows = lines.map((t, i) => {
    const y = 760 + i * 70;
    return `<text x="540" y="${y}" text-anchor="middle" fill="#e9e5dc" font-family="Cormorant Garamond, serif" font-size="30" font-style="italic" opacity="${1 - i*0.05}">${escapeXml(t.length > 60 ? t.slice(0,57)+'…' : t)}</text>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#1a1822"/>
      <stop offset="100%" stop-color="#0a0910"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${gold}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="540" cy="430" r="300" fill="url(#glow)"/>
  <text x="540" y="140" text-anchor="middle" fill="${gold}" font-family="Inter, sans-serif" font-size="22" letter-spacing="8" opacity="0.8">INNER WAKE</text>
  <text x="540" y="200" text-anchor="middle" fill="#e9e5dc" font-family="Cormorant Garamond, serif" font-size="56">${escapeXml(spec.shortName)} Current</text>
  <g transform="translate(540,430) scale(4.2)">${sigil}</g>
  <text x="540" y="660" text-anchor="middle" fill="${gold}" font-family="Inter, sans-serif" font-size="18" letter-spacing="6" opacity="0.7">${escapeXml(STAGE_LABEL[stage].toUpperCase())} · ${prog.practicesCompleted ?? 0} PRACTICES</text>
  <text x="540" y="720" text-anchor="middle" fill="#a8a098" font-family="Cormorant Garamond, serif" font-size="26" font-style="italic">${escapeXml(spec.tagline)}</text>
  ${beliefRows}
  <text x="540" y="${H - 80}" text-anchor="middle" fill="#6a6258" font-family="Inter, sans-serif" font-size="16" letter-spacing="4">innerwake.live</text>
</svg>`;
}

async function svgToPngBlob(svg: string, w = 1080, h = 1350): Promise<Blob> {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png', 0.95));
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function ResonanceCardExport({ slug }: { slug: DomainKey }) {
  const { progress } = useCurrentProgress(slug);
  const [busy, setBusy] = useState(false);
  const spec = CURRENT_SPECS[slug];
  const total = progress.beliefsLandedAsTrue.length + progress.beliefsLandedAsAlive.length;

  async function shareCard() {
    setBusy(true);
    try {
      const blob = await svgToPngBlob(buildSvg(slug));
      const filename = `innerwake-${slug}-sigil.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `My ${spec.shortName} Sigil`,
            text: `My ${spec.shortName} Sigil — a practice I'm keeping. Inner Wake.`,
          });
          return;
        } catch (e) {
          if ((e as DOMException)?.name === 'AbortError') return;
        }
      }
      saveBlob(blob, filename);
    } finally {
      setBusy(false);
    }
  }

  if (total === 0 && progress.practicesCompleted < 1) return null;

  return (
    <button
      onClick={shareCard}
      disabled={busy}
      className="soul-glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
      <span>{busy ? 'Rendering…' : `Share your ${spec.shortName} Sigil`}</span>
    </button>
  );
}
