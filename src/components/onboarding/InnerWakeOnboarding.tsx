import { useState, useEffect, useRef, useCallback } from "react";
import "./InnerWakeOnboarding.css";

/**
 * Inner Wake — Cinematic Pre-Signup Onboarding
 *
 * A full-screen, emotionally immersive onboarding experience that plays
 * before account creation. Uses water/ripple/breath metaphors, cinegraphic
 * motion, and gentle emotional copy to draw the user inward.
 *
 * Props:
 *   onComplete() — called when the user reaches the end and clicks to sign up
 *   onSkip()     — called if the user skips (optional, defaults to onComplete)
 *
 * Styles live in ./InnerWakeOnboarding.css for easier theming and dedupe.
 * Drop into your app and render as a full-screen overlay.
 */

interface InnerWakeOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const TOTAL_SLIDES = 8;

// Styles for this component live in ./InnerWakeOnboarding.css


// ─── Ripple background component ──────────────────────────────────────────────
function RippleField() {
  const ripples = Array.from({ length: 4 }, (_, i) => ({
    left: `${30 + i * 15}%`,
    top: `${40 + (i % 2) * 20}%`,
    delay: `${i * 1.5}s`,
    size: 100 + i * 40,
  }));

  return (
    <div className="iw-ripple-container">
      {ripples.map((r, i) => (
        <div
          key={i}
          className="iw-ripple"
          style={{
            left: r.left,
            top: r.top,
            width: r.size,
            height: r.size,
            marginLeft: -r.size / 2,
            marginTop: -r.size / 2,
            animationDelay: r.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Word reveal ──────────────────────────────────────────────────────────────
function WordReveal({
  text,
  className,
  gold,
  delay = 0,
}: {
  text: string;
  className?: string;
  gold?: boolean;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="iw-word"
          style={{ animationDelay: `${delay + i * 100}ms` }}
        >
          {gold ? <em>{w}</em> : w}
          {i < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </span>
  );
}

// ─── Line-by-line reveal ──────────────────────────────────────────────────────
function LineReveal({
  lines,
  delay = 0,
  className,
}: {
  lines: string[];
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="iw-line"
          style={{ animationDelay: `${delay + i * 600}ms` }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}

// ─── Current data ─────────────────────────────────────────────────────────────
const CURRENTS = [
  {
    icon: "💰",
    name: "Money",
    tagline: "Receive freely. Release resistance.",
    color: "rgba(200,164,90,0.12)",
    borderColor: "rgba(200,164,90,0.2)",
    description:
      "Your relationship with money is an emotional one. This current helps you soften the grip, notice the stories, and open to flow.",
  },
  {
    icon: "🌱",
    name: "Self",
    tagline: "Worth lives underneath the noise.",
    color: "rgba(139,195,74,0.08)",
    borderColor: "rgba(139,195,74,0.18)",
    description:
      "Confidence isn't loud. Here you tend the quiet trust of being you — not performing, not proving. Just being.",
  },
  {
    icon: "⚡",
    name: "Energy",
    tagline: "A body that feels alive, not managed.",
    color: "rgba(255,183,77,0.08)",
    borderColor: "rgba(255,183,77,0.18)",
    description:
      "Not productivity. Not optimization. Presence. The kind of vitality that comes when you stop running on empty.",
  },
  {
    icon: "🤝",
    name: "Relationship",
    tagline: "Love that flows both ways.",
    color: "rgba(149,117,205,0.08)",
    borderColor: "rgba(149,117,205,0.18)",
    description:
      "Belonging, boundaries, and the courage to be seen. This current is about the space between you and everyone else.",
  },
  {
    icon: "🌿",
    name: "Health",
    tagline: "Wholeness as home.",
    color: "rgba(102,187,106,0.08)",
    borderColor: "rgba(102,187,106,0.18)",
    description:
      "Trust in the body. Ease in the cells. Not fixing — tending. The way you'd tend a garden you love.",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function InnerWakeOnboarding({
  onComplete,
  onSkip,
}: InnerWakeOnboardingProps) {
  const [slide, setSlide] = useState(1);
  const [breathText, setBreathText] = useState("");
  const [breathCount, setBreathCount] = useState(0);
  const [showBreathPrompt, setShowBreathPrompt] = useState(false);
  const touchStartY = useRef<number | null>(null);



  // Breath animation for slide 1
  useEffect(() => {
    if (slide !== 1) return;
    const cycle = ["Breathe in…", "Hold…", "Let go…", ""];
    const seconds = [4, 3, 4, 0]; // count length per phase
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    let countInterval: ReturnType<typeof setInterval>;

    const run = () => {
      setBreathText(cycle[i]);
      const total = seconds[i];

      // start countdown for phases that have one
      clearInterval(countInterval);
      if (total > 0) {
        let remaining = total;
        setBreathCount(remaining);
        countInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(countInterval);
            setBreathCount(0);
          } else {
            setBreathCount(remaining);
          }
        }, 1000);
      } else {
        setBreathCount(0);
      }

      if (i === 3) setShowBreathPrompt(true);
      timeout = setTimeout(() => {
        i = (i + 1) % cycle.length;
        if (i <= 3) run();
      }, total > 0 ? total * 1000 : 2000);
    };
    const initial = setTimeout(run, 1200);
    return () => {
      clearTimeout(initial);
      clearTimeout(timeout);
      clearInterval(countInterval);
    };
  }, [slide]);

  const goTo = useCallback((n: number) => {
    setSlide(Math.max(1, Math.min(n, TOTAL_SLIDES)));
  }, []);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setSlide((s) => Math.min(s + 1, TOTAL_SLIDES));
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setSlide((s) => Math.max(s - 1, 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Touch swipe (vertical — feels more natural for descent metaphor)
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartY.current = null;
      if (Math.abs(dy) < 50) return;
      if (dy < 0)
        setSlide((s) => Math.min(s + 1, TOTAL_SLIDES));
      else setSlide((s) => Math.max(s - 1, 1));
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const skip = onSkip || onComplete;
  const sans = "'DM Sans', system-ui, sans-serif";
  const serif = "'Cormorant Garamond', Georgia, serif";

  return (
    <div
      className="iw-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Ambient layers */}
      <div className="iw-vignette" />
      <div className="iw-breathe-bg" />
      <RippleField />

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 1 — THE BREATH (Opening stillness)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 1 ? " active" : ""}`}>
        <div
          className="iw-glow"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="iw-breath-circle">
            <span
              style={{
                fontFamily: serif,
                fontSize: "1.6rem",
                fontStyle: "italic",
                color: "var(--ink)",
                position: "relative",
                zIndex: 2,
                transition: "opacity 1800ms ease",
                opacity: breathText ? 1 : 0,
                minHeight: "1.5em",
                textShadow: "0 0 24px rgba(200, 164, 90, 0.3)",
              }}
            >
              {breathText}
            </span>
          </div>
          {/* Breath counter */}
          <div
            style={{
              marginTop: "1.4rem",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "2rem",
              fontWeight: 300,
              color: "var(--gold-bright)",
              letterSpacing: "0.08em",
              minHeight: "2.4rem",
              opacity: breathCount > 0 ? 1 : 0,
              transition: "opacity 600ms ease",
              textShadow: "0 0 20px rgba(200, 164, 90, 0.35)",
            }}
            aria-live="polite"
          >
            {breathCount > 0 ? breathCount : ""}
          </div>
          <div
            style={{
              marginTop: "2.4rem",
              opacity: showBreathPrompt ? 1 : 0,
              transform: showBreathPrompt
                ? "translateY(0)"
                : "translateY(12px)",
              transition: "all 1200ms ease",
            }}
          >
            <h1
              className="iw-headline"
              style={{ fontSize: "clamp(2rem,5vw,3.6rem)" }}
            >
              You found <em>the quiet.</em>
            </h1>
            <p className="iw-subhead">
              This is a different kind of space.
              <br />
              No goals. No grades. No performance.
            </p>
            <button className="iw-cta" onClick={() => goTo(2)}>
              Step closer →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 2 — THE QUESTION (Emotional hook)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 2 ? " active" : ""}`}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 620 }}>
          <div className="iw-eyebrow">A question, before we begin</div>
          {slide === 2 && (
            <h1 className="iw-headline">
              <LineReveal
                lines={[
                  "When was the last time",
                  "you checked in with yourself",
                  "— not your calendar?",
                ]}
                delay={400}
                className="iw-headline"
              />
            </h1>
          )}
          <p
            className="iw-body"
            style={{
              opacity: 0,
              animation: slide === 2 ? "iwLineIn 900ms ease 2.6s forwards" : "none",
            }}
          >
            Most of us tend everything but the inner world.
            We track steps and screen time, but never ask:
            how does my relationship with money actually feel today?
            What about my sense of self?
          </p>
          <button
            className="iw-cta"
            onClick={() => goTo(3)}
            style={{
              opacity: 0,
              animation: slide === 2 ? "iwLineIn 900ms ease 3.4s forwards" : "none",
            }}
          >
            Show me what this is →
          </button>
        </div>
        <div className="iw-water-surface" />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 3 — THE CONCEPT (Five Currents overview)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 3 ? " active" : ""}`}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 680 }}>
          <div className="iw-eyebrow">The five currents</div>
          <h1 className="iw-headline">
            Five parts of your life
            <br />
            <em>flowing beneath the surface.</em>
          </h1>
          <p className="iw-body">
            Inner Wake organizes your inner world into five Currents — not to
            track them, but to tend them. Each one holds its own check-ins,
            affirmations, and a space to soften resistance.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.6rem",
              marginTop: "2rem",
            }}
          >
            {CURRENTS.map((c, i) => (
              <div
                key={c.name}
                style={{
                  padding: "0.5rem 1rem",
                  background: c.color,
                  border: `1px solid ${c.borderColor}`,
                  borderRadius: 100,
                  fontFamily: sans,
                  fontSize: "0.78rem",
                  color: "var(--ink)",
                  opacity: 0,
                  animation: slide === 3 ? `iwLineIn 600ms ease ${1.2 + i * 0.2}s forwards` : "none",
                }}
              >
                {c.icon} {c.name}
              </div>
            ))}
          </div>
          <button className="iw-cta" onClick={() => goTo(4)}>
            Meet each one →
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 4 — MONEY CURRENT (Deep dive)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 4 ? " active" : ""}`}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 600 }}>
          <div className="iw-current-icon" style={{ marginBottom: "1rem" }}>
            💰
          </div>
          <div className="iw-eyebrow">The Money Current</div>
          <h1
            className="iw-headline"
            style={{ fontSize: "clamp(2rem,5vw,3.8rem)" }}
          >
            What if money
            <br />
            <em>didn't have to feel heavy?</em>
          </h1>
          <p className="iw-body">
            Not budgeting. Not manifesting. Just noticing the stories you carry
            about receiving, spending, and worthiness — and gently loosening
            their grip.
          </p>
          <div
            className="iw-testimony"
            style={{
              margin: "2rem auto 0",
              opacity: 0,
              animation: slide === 4 ? "iwLineIn 900ms ease 1.4s forwards" : "none",
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.05rem",
                fontStyle: "italic",
                color: "var(--ink)",
                lineHeight: 1.7,
                margin: "0.8rem 0 0.6rem",
              }}
            >
              The Money Current shifted something I had been
              white-knuckling for years. Softer, not harder.
            </p>
            <span
              style={{
                fontFamily: sans,
                fontSize: "0.72rem",
                color: "var(--quiet)",
                letterSpacing: "0.1em",
              }}
            >
              — J., early practitioner
            </span>
          </div>
          <button className="iw-cta" onClick={() => goTo(5)}>
            Continue →
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 5 — SELF + ENERGY (Paired reveal)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 5 ? " active" : ""}`}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 640 }}>
          <div className="iw-eyebrow">Self · Energy</div>
          <h1
            className="iw-headline"
            style={{ fontSize: "clamp(2rem,5vw,3.6rem)" }}
          >
            The foundation
            <br />
            <em>you've been building on.</em>
          </h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginTop: "2rem",
              maxWidth: 540,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div
              className="iw-current-card"
              style={{
                opacity: 0,
                animation: slide === 5 ? "iwLineIn 800ms ease 0.6s forwards" : "none",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>🌱</div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: "0.4rem",
                }}
              >
                Self
              </div>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Worth, confidence, and the quiet trust of being you.
                Not performing. Not proving.
              </p>
            </div>
            <div
              className="iw-current-card"
              style={{
                opacity: 0,
                animation: slide === 5 ? "iwLineIn 800ms ease 1.0s forwards" : "none",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>⚡</div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: "0.4rem",
                }}
              >
                Energy
              </div>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Vitality, presence, and a body that feels alive —
                not optimized, not managed.
              </p>
            </div>
          </div>
          <button className="iw-cta" onClick={() => goTo(6)}>
            Two more →
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 6 — RELATIONSHIP + HEALTH (Paired reveal)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 6 ? " active" : ""}`}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 640 }}>
          <div className="iw-eyebrow">Relationship · Health</div>
          <h1
            className="iw-headline"
            style={{ fontSize: "clamp(2rem,5vw,3.6rem)" }}
          >
            The currents that hold
            <br />
            <em>everything together.</em>
          </h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginTop: "2rem",
              maxWidth: 540,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div
              className="iw-current-card"
              style={{
                opacity: 0,
                animation: slide === 6 ? "iwLineIn 800ms ease 0.6s forwards" : "none",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>🤝</div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: "0.4rem",
                }}
              >
                Relationship
              </div>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Belonging, boundaries, and the courage to let love flow
                in both directions.
              </p>
            </div>
            <div
              className="iw-current-card"
              style={{
                opacity: 0,
                animation: slide === 6 ? "iwLineIn 800ms ease 1.0s forwards" : "none",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>🌿</div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: "0.4rem",
                }}
              >
                Health
              </div>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Trust in the body. Ease in the cells. Not fixing —
                tending, the way you'd tend a garden.
              </p>
            </div>
          </div>
          <button className="iw-cta" onClick={() => goTo(7)}>
            How it works →
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 7 — THE PRACTICE (How it works — cinematic)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 7 ? " active" : ""}`}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 580 }}>
          <div className="iw-eyebrow">Your daily practice</div>
          <h1
            className="iw-headline"
            style={{ fontSize: "clamp(2rem,5vw,3.6rem)" }}
          >
            Not another thing
            <br />
            <em>on your list.</em>
          </h1>
          <div
            style={{
              marginTop: "2.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              textAlign: "left",
            }}
          >
            {[
              {
                step: "01",
                title: "Choose the Current calling you",
                desc: "Not all five. Not a routine. Just the one that needs tending today.",
              },
              {
                step: "02",
                title: "Check in with how you feel",
                desc: "Every entry begins with emotion — not a goal, not a metric. Where are you right now?",
              },
              {
                step: "03",
                title: "Soften, gather, open",
                desc: "Release resistance. Saturate in affirmations that actually feel true. Notice what opens.",
              },
              {
                step: "04",
                title: "Log the evidence",
                desc: "Small signs the current is shifting. Not proof — just noticing.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: "1.2rem",
                  alignItems: "flex-start",
                  opacity: 0,
                  animation: slide === 7 ? `iwLineIn 700ms ease ${0.8 + i * 0.35}s forwards` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: "var(--gold)",
                    marginTop: "0.3rem",
                    flexShrink: 0,
                    width: "1.8rem",
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: "0.8rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="iw-cta" onClick={() => goTo(8)}>
            I'm ready →
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SLIDE 8 — THE INVITATION (Final — leads to signup)
          ════════════════════════════════════════════════════════════════════ */}
      <section className={`iw-slide${slide === 8 ? " active" : ""}`}>
        <div
          className="iw-glow"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 700,
            height: 700,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            maxWidth: 560,
          }}
        >
          <div className="iw-breath-circle" style={{ margin: "0 auto 2rem", width: 100, height: 100 }}>
            <span style={{ fontSize: "1.6rem", position: "relative", zIndex: 2 }}>🌊</span>
          </div>
          {slide === 8 && (
            <h1 className="iw-headline">
              <WordReveal text="Your practice" delay={300} />
              <br />
              <WordReveal text="is already" delay={700} />{" "}
              <WordReveal text="inside you." gold delay={1000} />
            </h1>
          )}
          <p
            className="iw-subhead"
            style={{
              opacity: 0,
              animation: slide === 8 ? "iwLineIn 1000ms ease 2s forwards" : "none",
            }}
          >
            Inner Wake is the quiet room you return to.
            <br />
            Free to begin. Yours to keep.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.8rem",
              opacity: 0,
              animation: slide === 8 ? "iwLineIn 900ms ease 2.8s forwards" : "none",
            }}
          >
            <button
              className="iw-cta iw-cta-primary"
              onClick={onComplete}
            >
              Begin your practice →
            </button>
            <button className="iw-ghost-btn" onClick={() => goTo(1)}>
              Experience it again
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          OVERLAY — Skip + Progress
          ════════════════════════════════════════════════════════════════════ */}
      <div className="iw-overlay">
        <button className="iw-skip" onClick={skip}>
          skip
        </button>
        <div className="iw-progress-wrap">
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <button
              key={i}
              className={`iw-progress-dot${slide === i + 1 ? " active" : ""}`}
              onClick={() => goTo(i + 1)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
