import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import brandLogo from '@/assets/inner-wake-orb-logo.png';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (trimmed.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (trimmed !== confirm.trim()) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: trimmed });
      if (error) throw error;
      toast.success('Password updated. Welcome back.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-12 bg-background safe-top safe-x">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.15), hsl(42 65% 58% / 0.03))' }}>
            <img src={brandLogo} alt="Inner Wake" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Set New Password</h1>
          <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
            required
            minLength={6}
            className="w-full rounded-xl border border-border/30 bg-card/50 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors backdrop-blur-sm"
          />
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
            className="w-full rounded-xl border border-border/30 bg-card/50 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-4 min-h-[48px] text-sm font-medium text-primary-foreground transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
          >
            {loading ? '…' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
