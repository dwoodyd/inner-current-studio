import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Sigil } from '@/components/onboarding/Sigil';
import { toast } from 'sonner';
import { BarChart3, Layers, Sparkles, Activity, Bell, Palette, Volume2, CreditCard, Download, LogOut, Trash2, ChevronRight, Info, Shield, Heart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Profile() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const totalCheckIns = state.checkIns.length;
  const totalReturns = state.todayFlow.returnCount;
  const cycleReturns = Math.max(totalReturns, state.checkIns.length);
  const totalRituals = state.wheels.length + state.momentumSessions.length;
  const sigilProgress = Math.min(1, (totalCheckIns + totalRituals * 2 + state.gatheredSequences.length) / 30);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      await signOut();
      toast.success('Your account and data have been deleted.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || !data?.url) throw error;
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('No active billing portal is available for this account yet.');
    }
  };

  const hasCompanion = Boolean(state.onboarding.completed);

  const sections = [
    {
      icon: Heart,
      label: hasCompanion ? 'Your companion' : 'Set up your companion',
      description: hasCompanion ? 'Revisit your sigil & first affirmation' : 'A 2-minute personal ritual',
      to: '/onboarding',
      accent: !hasCompanion,
    },
    { icon: Sparkles, label: 'Current Guide', description: 'AI emotional companion', to: '/profile/guide', accent: true },
    { icon: Activity, label: 'Pattern Mirror', description: 'Your emotional rhythms', to: '/profile/patterns' },
    { icon: BarChart3, label: 'Current Insights', description: 'Pattern visibility', to: '/profile/insights' },
    { icon: Layers, label: 'My Rituals', description: 'Custom ritual sequences', to: '/profile/rituals' },
    { icon: Bell, label: 'Notifications', description: 'Gentle reminders', to: '/profile/notifications' },
    { icon: Palette, label: 'Theme', description: 'Dark or light mode' },
    { icon: Volume2, label: 'Audio', description: 'Sound and haptic settings' },
    { icon: CreditCard, label: 'Subscription', description: 'Manage plan, payment, and invoices', action: handleManageSubscription },
    { icon: Download, label: 'Export & Backup', description: 'Save your data' },
    { icon: Info, label: 'About Inner Wake', description: 'Our mission & philosophy', to: '/about' },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', description: 'Manage users & roles', to: '/admin', accent: true }] : []),
  ];

  return (
    <div className="relative">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.05), transparent 70%)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6 safe-top"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground font-heading italic">Your rhythm, not your performance</p>
        </motion.div>

        {hasCompanion && (
          <motion.div variants={fadeUp} className="soul-glass-elevated rounded-2xl p-5 text-center overflow-hidden">
            <Sigil
              seed={state.onboarding.companionSigil || state.onboarding.companionName || 'Inner Wake'}
              progress={sigilProgress}
              size={132}
              className="mx-auto"
            />
            <h2 className="mt-2 font-heading text-xl text-foreground">{state.onboarding.companionName || 'Your companion'}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Sigil evolution · {Math.round(sigilProgress * 100)}% awakened</p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: 'Check-ins', value: totalCheckIns },
            { label: 'This cycle', value: cycleReturns },
            { label: 'Rituals', value: totalRituals },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="soul-glass-elevated text-center py-5 rounded-2xl"
            >
              <p className="text-xl font-heading font-semibold text-primary">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 tracking-wide uppercase">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Sections */}
        <motion.div variants={fadeUp} className="soul-glass rounded-2xl overflow-hidden divide-y divide-border/10">
          {sections.map(({ icon: Icon, label, description, to, action, accent }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              onClick={() => action ? action() : to && navigate(to)}
              className={`w-full flex items-center gap-4 px-4 sm:px-5 py-4 min-h-[56px] transition-all duration-200 hover:bg-muted/10 active:scale-[0.99] ${
                accent ? 'bg-primary/[0.03]' : ''
              }`}
              whileTap={{ scale: 0.99 }}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                accent
                  ? 'bg-primary/10 border border-primary/15'
                  : 'bg-muted/30 border border-border/20'
              }`}>
                <Icon
                  size={18}
                  className={accent ? 'text-primary' : 'text-muted-foreground'}
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 text-left">
                <span className={`text-sm font-medium ${accent ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                <br />
                <span className="text-[11px] text-muted-foreground">{description}</span>
              </div>
              {(to || action) && <ChevronRight size={14} className="text-muted-foreground/40" />}
            </motion.button>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.button
          variants={fadeUp}
          onClick={signOut}
          className="w-full soul-glass rounded-2xl flex items-center justify-center gap-2 px-4 py-4 min-h-[48px] text-sm text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut size={15} />
          Sign Out
        </motion.button>

        {/* Delete Account */}
        <motion.button
          variants={fadeUp}
          onClick={() => setShowDeleteDialog(true)}
          className="w-full soul-glass rounded-2xl flex items-center justify-center gap-2 px-4 py-4 min-h-[48px] text-sm text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 active:scale-[0.98]"
        >
          <Trash2 size={15} />
          Delete Account
        </motion.button>

        {/* Footer */}
        <motion.div variants={fadeUp} className="text-center pt-2 space-y-1.5">
          <p className="text-[10px] text-muted-foreground/40 truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground/50">Inner Wake v1.0</p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <a href="/privacy" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground underline min-h-[44px] flex items-center">Privacy Policy</a>
            <span className="text-[11px] text-muted-foreground/20">·</span>
            <a href="/terms" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground underline min-h-[44px] flex items-center">Terms of Service</a>
          </div>
          <p className="text-xs text-muted-foreground/30 font-heading italic">Wake the inner current</p>
        </motion.div>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="soul-glass border-border/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading text-foreground">Delete your account?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                This will permanently remove all your check-ins, rituals, reflections, and personal data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border/20">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting…' : 'Delete Everything'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
