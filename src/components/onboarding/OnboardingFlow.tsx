import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/lib/AppContext";
import { BreathingOrb } from "./BreathingOrb";
import { Sigil } from "./Sigil";
import { AmbientAudio, playChime } from "./AmbientAudio";
import { Paywall } from "./Paywall";
import TypingText from "@/components/TypingText";

const CURRENTS = [
  { id: "money", name: "Money", essence: "Receiving with ease", hue: 42 },
  { id: "self", name: "Self", essence: "Coming home to you", hue: 280 },
  { id: "energy", name: "Energy", essence: "Steady aliveness", hue: 25 },
  { id: "relationships", name: "Relationships", essence: "Soft connection", hue: 340 },
  { id: "health", name: "Health", essence: "Body as ally", hue: 160 },
] as const;

type CurrentId = typeof CURRENTS[number]["id"];

const CARRYING_OPTIONS = [
  "Pressure I can't put down",
  "A quiet anxious hum",
  "Doubt about myself",
  "Heaviness around money",
  "Disconnection from my body",
  "Old patterns repeating",
];

const WANTING_OPTIONS = [
  "Steadiness",
  "Soft, alive presence",
  "Trust in myself",
  "Spaciousness around money",
  "A felt-sense of being held",
  "Quiet clarity",
];

const ease = [0.22, 1, 0.36, 1] as const;

interface OnboardingFlowProps {
  onSkipPaywall: () => void;
}

export function OnboardingFlow({ onSkipPaywall }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeOnboarding } = useAppState();

  const [act, setAct] = useState(0); // 0..6
  const [carrying, setCarrying] = useState<string>("");
  const [wanting, setWanting] = useState<string>("");
  const [companionName, setCompanionName] = useState<string>("");
  const [chosenCurrent, setChosenCurrent] = useState<CurrentId | "">("");
  const [affirmation, setAffirmation] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const current = CURRENTS.find((c) => c.id === chosenCurrent);
  const hue = current?.hue ?? 42;

  const next = () => setAct((a) => a + 1);

  const persistCompanion = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        companion_name: companionName,
        companion_feeling: carrying,
        companion_sigil: companionName, // seed
        free_current: chosenCurrent || null,
      })
      .eq("user_id", user.id);
  };

  const generateAffirmation = async () => {
    setGenerating(true);
    playChime();
    try {
      const { data } = await supabase.functions.invoke("first-affirmation", {
        body: {
          companionName: companionName || "my Current",
          carrying: carrying || "what I'm holding",
          wanting: wanting || "steadiness",
        },
      });
      setAffirmation(data?.affirmation || "I am held by something steady within me, even now.");
    } catch {
      setAffirmation("I am held by something steady within me, even now.");
    } finally {
      setGenerating(false);
    }
  };

  const finishOnboarding = () => {
    completeOnboarding({
      reason: carrying || "felt-sense",
      style: "Guided and reflective",
      challenge: carrying || "presence",
    });
  };

  // Acts ----------------------------------------------------------------
  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, hsl(${hue} 35% 12%), hsl(220 25% 5%) 70%)`,
      }}
    >
      <AmbientAudio active={act > 0} />

      {/* ambient particles */}
      <Particles hue={hue} />

      <AnimatePresence mode="wait">
        {/* ACT 0 — Threshold */}
        {act === 0 && (
          <motion.div
            key="act-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 1.4, ease }}
            className="relative z-10 flex flex-col items-center text-center max-w-md"
          >
            <BreathingOrb size={260} hue={42} />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.2 }}
              className="mt-12 space-y-4"
            >
              <h1 className="font-heading text-4xl font-light tracking-wide text-foreground">
                Welcome
              </h1>
              <p className="font-heading text-lg italic text-muted-foreground max-w-xs">
                Before we begin, take one slow breath with me.
              </p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4, duration: 1.5 }}
              onClick={next}
              className="mt-12 text-sm tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              I'm ready
            </motion.button>
          </motion.div>
        )}

        {/* ACT 1 — Name what you're carrying */}
        {act === 1 && (
          <motion.div
            key="act-1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.8, ease }}
            className="relative z-10 w-full max-w-md space-y-8"
          >
            <div className="text-center space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-primary/70">Act One</p>
              <h2 className="font-heading text-3xl font-light text-foreground">
                What are you carrying right now?
              </h2>
              <p className="text-sm text-muted-foreground italic">No judgment. Just honesty.</p>
            </div>
            <div className="space-y-2">
              {CARRYING_OPTIONS.map((opt, i) => (
                <motion.button
                  key={opt}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  onClick={() => setCarrying(opt)}
                  className={`w-full text-left rounded-xl border px-5 py-4 text-sm font-light transition-all active:scale-[0.99] ${
                    carrying === opt
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/30 bg-card/40 text-muted-foreground hover:border-border/60"
                  }`}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!carrying}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-20 active:scale-[0.98]"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* ACT 2 — What you want to feel */}
        {act === 2 && (
          <motion.div
            key="act-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.8, ease }}
            className="relative z-10 w-full max-w-md space-y-8"
          >
            <div className="text-center space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-primary/70">Act Two</p>
              <h2 className="font-heading text-3xl font-light text-foreground">
                What do you want to feel instead?
              </h2>
              <p className="text-sm text-muted-foreground italic">
                Not perfect. Just truer.
              </p>
            </div>
            <div className="space-y-2">
              {WANTING_OPTIONS.map((opt, i) => (
                <motion.button
                  key={opt}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  onClick={() => setWanting(opt)}
                  className={`w-full text-left rounded-xl border px-5 py-4 text-sm font-light transition-all active:scale-[0.99] ${
                    wanting === opt
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/30 bg-card/40 text-muted-foreground hover:border-border/60"
                  }`}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!wanting}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-20 active:scale-[0.98]"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* ACT 3 — Meet your Current (name your companion) */}
        {act === 3 && (
          <motion.div
            key="act-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease }}
            className="relative z-10 w-full max-w-md space-y-8 flex flex-col items-center text-center"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-primary/70">Act Three</p>
            <h2 className="font-heading text-3xl font-light text-foreground">
              Meet your Current
            </h2>
            <p className="text-sm text-muted-foreground italic max-w-xs">
              A presence that walks with you. Give it a name —
              one word that feels true. You can change it later.
            </p>
            <BreathingOrb size={180} hue={42} intensity={companionName ? 1 : 0.6} />
            <input
              type="text"
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value.slice(0, 24))}
              placeholder="e.g. Stillness, Ember, Tide…"
              className="w-full rounded-xl border border-border/30 bg-card/40 px-5 py-4 text-center text-lg font-heading italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
              autoFocus
            />
            <button
              onClick={next}
              disabled={companionName.trim().length < 2}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-20 active:scale-[0.98]"
            >
              This is my Current
            </button>
          </motion.div>
        )}

        {/* ACT 4 — The Five Waters (choose your free Current) */}
        {act === 4 && (
          <motion.div
            key="act-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.8, ease }}
            className="relative z-10 w-full max-w-md space-y-8"
          >
            <div className="text-center space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-primary/70">Act Four</p>
              <h2 className="font-heading text-3xl font-light text-foreground">
                Five waters run through you.
              </h2>
              <p className="text-sm text-muted-foreground italic">
                Choose the one that needs you most. You'll begin there — free, forever.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {CURRENTS.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={() => setChosenCurrent(c.id)}
                  className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all active:scale-[0.99] ${
                    chosenCurrent === c.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/30 bg-card/40 hover:border-border/60"
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, hsl(${c.hue} 80% 65% / 0.8), hsl(${c.hue} 60% 35% / 0.2) 70%)`,
                      boxShadow: `0 0 20px hsl(${c.hue} 70% 55% / 0.3)`,
                    }}
                  />
                  <div>
                    <div className="font-heading text-lg text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground italic">{c.essence}</div>
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!chosenCurrent}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-20 active:scale-[0.98]"
            >
              Choose this Current
            </button>
          </motion.div>
        )}

        {/* ACT 5 — First Ritual: sigil reveal + AI affirmation */}
        {act === 5 && (
          <motion.div
            key="act-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease }}
            className="relative z-10 w-full max-w-md space-y-8 flex flex-col items-center text-center"
            onAnimationComplete={() => {
              if (!affirmation && !generating) {
                persistCompanion();
                generateAffirmation();
              }
            }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-primary/70">Act Five</p>
            <h2 className="font-heading text-3xl font-light text-foreground">
              Your sigil
            </h2>
            <p className="text-sm text-muted-foreground italic max-w-xs">
              Born from your name and the {current?.name} Current.
              No one else has this one.
            </p>
            <Sigil seed={companionName + chosenCurrent} hue={hue} size={220} />
            <p className="font-heading text-2xl italic text-foreground">{companionName}</p>

            <div className="min-h-[100px] w-full max-w-sm flex items-center justify-center">
              {generating ? (
                <p className="text-sm text-muted-foreground italic animate-pulse">
                  Listening for your first affirmation…
                </p>
              ) : affirmation ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2 }}
                  className="space-y-3"
                >
                  <p className="text-xs tracking-[0.25em] uppercase text-primary/60">A gift for today</p>
                  <p className="font-heading text-xl text-foreground leading-snug px-4">
                    <TypingText text={`"${affirmation}"`} speed={45} />
                  </p>
                </motion.div>
              ) : null}
            </div>

            <button
              onClick={next}
              disabled={!affirmation}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all disabled:opacity-20 active:scale-[0.98]"
            >
              Carry this with me
            </button>
          </motion.div>
        )}

        {/* ACT 6 — Paywall (soft) */}
        {act === 6 && (
          <motion.div
            key="act-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="relative z-10 w-full max-w-md"
          >
            <Paywall
              companionName={companionName}
              chosenCurrent={current?.name || ""}
              onContinueFree={() => {
                finishOnboarding();
                onSkipPaywall();
                navigate(`/${chosenCurrent}`);
              }}
              onPurchased={() => {
                finishOnboarding();
                navigate(`/${chosenCurrent || ""}`);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* progress dots */}
      {act > 0 && act < 6 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === act ? "w-6 bg-primary" : i < act ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Particles({ hue }: { hue: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => {
        const left = (i * 53) % 100;
        const top = (i * 37) % 100;
        const delay = (i % 6) * 1.5;
        const size = 2 + (i % 4);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: `hsl(${hue} 80% 70%)`,
              filter: "blur(1px)",
              opacity: 0.25,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.45, 0.1],
            }}
            transition={{
              duration: 8 + (i % 5),
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
