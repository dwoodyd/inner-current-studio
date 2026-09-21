/**
 * Clickjacking guard.
 *
 * `X-Frame-Options` and CSP `frame-ancestors` can only be set as real HTTP
 * response headers — a <meta> CSP cannot express them, and the hosting layer
 * currently does not emit them. Until it does, this runtime guard refuses to
 * render inside a frame owned by anyone but us (the Lovable editor preview and
 * our own origins are allowed).
 */

const ALLOWED_ANCESTOR = /^https?:\/\/([a-z0-9-]+\.)*(lovable\.app|lovable\.dev|lovableproject\.com|innerwake\.live|localhost(:\d+)?)$/i;

function ancestorOrigins(): string[] {
  const list = (window.location as unknown as { ancestorOrigins?: DOMStringList }).ancestorOrigins;
  if (list && list.length) return Array.from({ length: list.length }, (_, i) => list[i]);
  // Firefox/Safari fallback: the framing page is the referrer on first load.
  if (document.referrer) {
    try {
      return [new URL(document.referrer).origin];
    } catch {
      return ['unknown'];
    }
  }
  return ['unknown'];
}

export function enforceFrameAncestors(): void {
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true; // cross-origin access threw — definitely framed by a stranger
  }
  if (!framed) return;

  const hostile = ancestorOrigins().some((origin) => !ALLOWED_ANCESTOR.test(origin));
  if (!hostile) return;

  // Try to break out; if the parent blocks navigation, blank the document so
  // nothing clickable is exposed to the framing page.
  try {
    if (window.top) {
      window.top.location.href = window.location.href;
      return;
    }
  } catch {
    /* cross-origin — fall through */
  }
  document.documentElement.innerHTML =
    '<body style="margin:0;background:#07070A;color:#c9943a;font:16px/1.6 system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">' +
    '<p>Inner Wake cannot be displayed inside another site.<br><a style="color:#c9943a" href="https://app.innerwake.live" target="_blank" rel="noopener">Open Inner Wake</a></p></body>';
}
