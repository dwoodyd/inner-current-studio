import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';
import { ArrowRight, Chrome, Users } from 'lucide-react';
import TypingText from '@/components/TypingText';
import brandLogo from '@/assets/inner-wake-logo.png';

const INNER_WAKE_ICON = '/icon.svg';

const RATE_LIMIT_WINDOW = 60_000;
const MAX_ATTEMPTS = 5;

/* ── Act 2: "Aha Moment" sample reframes shown before signup ── */
const REFRAME_STEPS = [
  {
    pain: '"I can\'t stop overthinking everything."',
    reframe: 'What if your mind isn\'t broken — it\'s just unsupervised? Inner Wake gives your thoughts a softer track to run on.',
  },
  {
    pain: '"I feel stuck but I don\'t know why."',
    reframe: 'You don\'t need to name the fog to move through it. Sometimes the next clear thought is only one breath away.',
  },
  {
    pain: '"I want to feel lighter but nothing works."',
    reframe: 'Relief doesn\'t arrive through effort. It arrives when you stop gripping. Let\'s practice that together.',
  },
];

export default function Auth() {
  const [phase, setPhase] = useState<'landing' | 'aha' | 'auth'>('landing');
  const [ahaStep, setAhaStep] = useState(0);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const attemptsRef = useRef<number[]>([]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (attemptsRef.current.length >= MAX_ATTEMPTS) {
      const oldest = attemptsRef.current[0];
      const waitSec = Math.ceil((RATE_LIMIT_WINDOW - (now - oldest)) / 1000);
      toast.error(`Too many attempts. Try again in ${waitSec}s.`);
      return false;
    }
    attemptsRef.current.push(now);
    return true;
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success('Check your email for a reset link.');
    } catch {
      toast.error('Unable to send reset link. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) return;
    if (trimmedPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (trimmedPassword.length > 128) { toast.error('Password is too long.'); return; }
    if (trimmedEmail.length > 255) { toast.error('Email is too long.'); return; }
    if (!checkRateLimit()) return;
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Account created. Welcome to Inner Wake.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() ?? '';
      if (msg.includes('invalid login')) toast.error('Incorrect email or password.');
      else if (msg.includes('already registered') || msg.includes('already been registered')) toast.error('An account with that email already exists.');
      else if (msg.includes('rate limit') || msg.includes('too many')) toast.error('Too many attempts. Please wait a moment.');
      else if (msg.includes('password') && msg.includes('leaked')) toast.error('That password has appeared in a data breach. Please choose a different one.');
      else toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const advanceAha = () => {
    if (ahaStep < REFRAME_STEPS.length - 1) {
      setAhaStep(s => s + 1);
    } else {
      setMode('signup');
      setPhase('auth');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch {
      toast.error('Google sign-in is unavailable right now.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-12 bg-background relative overflow-hidden safe-top safe-x">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.08), transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(265 25% 45% / 0.06), transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ── ACT 1: Landing / Problem ── */}
        {phase === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm flex flex-col items-center text-center gap-8"
          >
            <motion.div
              className="h-24 w-24 rounded-full flex items-center justify-center"
              style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.15), hsl(42 65% 58% / 0.03))' }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={brandLogo} alt="Inner Wake" className="h-16 w-16 object-contain" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">Inner Wake</h1>
              <p className="font-heading text-lg text-muted-foreground italic leading-relaxed">
                When your mind won't quiet,<br />your emotions feel heavy,<br />or you've lost your center —
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-[18rem] mx-auto">
                this is your place to return.
              </p>
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center gap-3 soul-glass rounded-full px-5 py-2.5"
            >
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-medium"
                    style={{
                      background: `hsl(${42 + i * 30} 45% ${40 + i * 8}% / 0.4)`,
                      color: `hsl(${42 + i * 30} 45% 75%)`,
                    }}
                  >
                    {['✦', '◈', '❋', '✧'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-foreground/80">12,400+ returns to center</p>
                <p className="text-[10px] text-muted-foreground/50">Join a quiet community</p>
              </div>
            </motion.div>

            <div className="flex flex-col gap-3 w-full">
              <motion.button
                onClick={() => setPhase('aha')}
                className="w-full rounded-2xl bg-primary py-4 min-h-[48px] text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                Show me how it works
                <ArrowRight size={15} />
              </motion.button>
              <button
                onClick={() => { setMode('login'); setPhase('auth'); }}
                className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-150 py-3 min-h-[44px]"
              >
                I already have an account
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ACT 2: Aha Moment — Sample Reframes ── */}
        {phase === 'aha' && (
          <motion.div
            key={`aha-${ahaStep}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm flex flex-col items-center text-center gap-8"
          >
            {/* Progress dots */}
            <div className="flex gap-2">
              {REFRAME_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === ahaStep ? 'w-6 bg-primary' : i < ahaStep ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>

            {/* Pain point */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="soul-glass-elevated rounded-2xl px-6 py-5 w-full"
            >
              <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-3">You might say…</p>
              <p className="font-heading text-base text-foreground/80 italic leading-relaxed">
                {REFRAME_STEPS[ahaStep].pain}
              </p>
            </motion.div>

            {/* Reframe */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="soul-glass rounded-2xl px-6 py-5 w-full border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <img src={brandLogo} alt="" className="h-3 w-3 object-contain" />
                </div>
                <p className="text-xs text-primary/60 uppercase tracking-widest">Inner Wake responds…</p>
              </div>
              <TypingText
                key={`reframe-${ahaStep}`}
                text={REFRAME_STEPS[ahaStep].reframe}
                speed={25}
                delay={500}
                className="text-sm text-foreground/85 leading-relaxed"
              />
            </motion.div>

            <motion.button
              onClick={advanceAha}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-full rounded-2xl bg-primary py-4 min-h-[48px] text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              {ahaStep < REFRAME_STEPS.length - 1 ? 'Show me another' : 'Start my practice'}
              <ArrowRight size={15} />
            </motion.button>

            <button
              onClick={() => { setMode('login'); setPhase('auth'); }}
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-150 py-3 min-h-[44px]"
            >
              Skip — I already have an account
            </button>
          </motion.div>
        )}

        {/* ── ACT 3: Auth Form (Paywall / Commitment) ── */}
        {phase === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm space-y-8"
          >
            {/* Logo */}
            <div className="flex flex-col items-center gap-6 text-center">
              <motion.div
                className="h-20 w-20 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.15), hsl(42 65% 58% / 0.03))' }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={INNER_WAKE_ICON} alt="Inner Wake" className="h-14 w-14 object-contain" />
              </motion.div>
              <div className="space-y-2">
                <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">Inner Wake</h1>
                <p className="font-heading text-base font-light italic text-muted-foreground">
                  {forgotMode ? (resetSent ? 'Check your email.' : 'Reset your password.') : mode === 'login' ? 'Welcome back.' : 'Begin your practice.'}
                </p>
              </div>
            </div>

            {/* Form */}
            {forgotMode ? (
              resetSent ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">We sent a reset link to <span className="text-foreground">{email}</span>. Check your inbox.</p>
                  <button onClick={() => { setForgotMode(false); setResetSent(false); }} className="text-sm text-primary hover:text-primary/80 transition-colors py-3 min-h-[44px]">
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-xl border border-border/30 bg-card/50 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors backdrop-blur-sm"
                  />
                  <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-4 min-h-[48px] text-sm font-medium text-primary-foreground transition-all duration-200 disabled:opacity-40 active:scale-[0.98]">
                    {loading ? '…' : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => setForgotMode(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 min-h-[44px]">
                      Back to sign in
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-border/30 bg-card/50 py-4 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/10 disabled:opacity-40 active:scale-[0.98]"
                >
                  <Chrome size={16} /> Continue with Google
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/20" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">or</span>
                  <div className="h-px flex-1 bg-border/20" />
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-xl border border-border/30 bg-card/50 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors backdrop-blur-sm"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-border/30 bg-card/50 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors backdrop-blur-sm"
                  />
                  </div>
                  {mode === 'login' && (
                    <div className="text-right">
                      <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1 min-h-[44px]">
                        Forgot password?
                      </button>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-4 min-h-[48px] text-sm font-medium text-primary-foreground transition-all duration-200 disabled:opacity-40 active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20">
                    {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </div>
            )}

            {/* Toggle */}
            <div className="text-center">
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 py-3 min-h-[44px]"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            {/* Privacy links */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link to="/privacy" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground underline min-h-[44px] flex items-center">Privacy Policy</Link>
              <span className="text-[11px] text-muted-foreground/20">·</span>
              <Link to="/terms" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground underline min-h-[44px] flex items-center">Terms of Service</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
