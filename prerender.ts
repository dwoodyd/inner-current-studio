import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
  LEGAL_UPDATED,
  PRICING_MOR_NOTE,
  PRICING_TIERS,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  REFUND_INTRO,
  REFUND_SECTIONS,
  TERMS_INTRO,
  TERMS_SECTIONS,
  type LegalSection,
} from './src/content/legal';

/**
 * Build-time prerender for the public legal / pricing routes.
 *
 * The app is a client-rendered SPA, so every route used to return the same
 * near-empty HTML shell. Crawlers that do not execute JavaScript (Paddle's
 * readiness crawler among them) therefore saw no policy text at all.
 *
 * This plugin emits a real HTML file per public policy route, each carrying the
 * full copy in the initial response inside <main id="crawlable-content">.
 * React removes that node on mount (see src/main.tsx), so human visitors get
 * the normal app and only non-JS clients ever see the static text.
 */

const SITE = 'https://app.innerwake.live';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionsHtml(sections: LegalSection[]): string {
  return sections
    .map((s) => `<section><h2>${esc(s.title)}</h2><p>${esc(s.content)}</p></section>`)
    .join('\n');
}

function pricingHtml(): string {
  const tiers = PRICING_TIERS.map(
    (t) => `<section>
<h2>${esc(t.name)} — ${esc(t.price)} ${esc(t.period)}</h2>
${t.note ? `<p>${esc(t.note)}</p>` : ''}
<p>${esc(t.tagline)}</p>
<ul>${t.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
</section>`,
  ).join('\n');
  return `${tiers}
<section><h2>Merchant of Record</h2><p>${esc(PRICING_MOR_NOTE)}</p></section>
<nav><a href="/terms">Terms of Service</a> <a href="/refund">Refund Policy</a> <a href="/privacy">Privacy Notice</a></nav>`;
}

type Page = {
  route: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  body: string;
};

const PAGES: Page[] = [
  {
    route: 'terms',
    title: 'Terms of Service — Inner Wake',
    description:
      'Inner Wake Terms of Service: seller details, Paddle as Merchant of Record, subscription and payment terms, acceptable use, and suspension.',
    heading: 'Terms of Service',
    intro: TERMS_INTRO,
    body: sectionsHtml(TERMS_SECTIONS),
  },
  {
    route: 'privacy',
    title: 'Privacy Notice — Inner Wake',
    description:
      'Inner Wake Privacy Notice: data controller, categories of personal data, legal bases, retention, and data recipients including Paddle.',
    heading: 'Privacy Notice',
    intro: PRIVACY_INTRO,
    body: sectionsHtml(PRIVACY_SECTIONS),
  },
  {
    route: 'refund',
    title: 'Refund Policy — Inner Wake',
    description:
      'Inner Wake Refund Policy: 30-day money-back guarantee on all paid plans, how to request a refund through Paddle, and processing times.',
    heading: 'Refund Policy',
    intro: REFUND_INTRO,
    body: sectionsHtml(REFUND_SECTIONS),
  },
  {
    route: 'pricing',
    title: 'Pricing — Inner Wake',
    description:
      'Inner Wake pricing: free forever, Pro monthly $4.99, Pro annual $39, Lifetime $99. All prices in USD, taxes calculated at checkout.',
    heading: 'Inner Wake pricing',
    intro: 'Start free. Upgrade only if the practice earns it. No dark patterns, no hidden fees. All prices in USD; taxes are calculated at checkout.',
    body: pricingHtml(),
  },
];

function renderPage(shell: string, page: Page): string {
  const url = `${SITE}/${page.route}`;
  let html = shell;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${esc(page.description)}" />`,
  );
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`);

  const crawlable = `<main id="crawlable-content">
<h1>${esc(page.heading)}</h1>
<p>Last updated: ${esc(LEGAL_UPDATED)}</p>
<p>${esc(page.intro)}</p>
${page.body}
<footer><p>© 2026 DeWayne Woods · Inner Wake. Purchases are processed by Paddle.com Market Limited, our Merchant of Record.</p></footer>
</main>
`;

  return html.replace('<div id="root"></div>', `${crawlable}<div id="root"></div>`);
}

export function prerenderLegalPages(): Plugin {
  return {
    name: 'inner-wake-prerender-legal',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      const shellPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(shellPath)) return;
      const shell = fs.readFileSync(shellPath, 'utf8');

      for (const page of PAGES) {
        const dir = path.join(outDir, page.route);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), renderPage(shell, page), 'utf8');
      }
      // /refunds is an alias route in the SPA router.
      const refunds = PAGES.find((p) => p.route === 'refund');
      if (refunds) {
        fs.mkdirSync(path.join(outDir, 'refunds'), { recursive: true });
        fs.writeFileSync(
          path.join(outDir, 'refunds', 'index.html'),
          renderPage(shell, { ...refunds, route: 'refunds' }),
          'utf8',
        );
      }
    },
  };
}
