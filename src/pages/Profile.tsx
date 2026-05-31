import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Sigil } from '@/components/onboarding/Sigil';
import PracticeConstellation from '@/components/PracticeConstellation';
import { toast } from 'sonner';
import { BarChart3, Layers, Sparkles, Activity, Archive, Bell, Palette, Volume2, CreditCard, Download, LogOut, Trash2, ChevronRight, Info, Shield, Heart, Lock } from 'lucide-react';
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
  const { isFoundingMember, detailedTier, isPremium } = useSubscription();
  const proGated = !isPremium;
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

  // Subscription tile now routes to the dedicated /profile/subscription page,
  // which itself offers a "View invoices & payment details" portal launcher.

  const hasCompanion = Boolean(state.onboarding.completed);

  const sectionGroups = [
    {
      title: 'Practice',
      items: [
        { icon: Heart, label: hasCompanion ? 'Your companion' : 'Set up your companion', description: hasCompanion ? 'Sigil & first affirmation' : 'A 2-minute personal ritual', to: '/onboarding', accent: !hasCompanion },
        { icon: Sparkles, label: 'Current Guide', description: 'AI emotional companion', to: '/profile/guide', accent: true },
        { icon: Layers, label: 'My Rituals', description: 'Custom ritual sequences', to: '/profile/rituals', proLock: proGated },
      ],
    },
    {
      title: 'Insights',
      items: [
        { icon: Activity, label: 'Pattern Mirror', description: 'Your emotional rhythms', to: '/profile/patterns', proLock: proGated },
        { icon: Archive, label: 'Resonance Library', description: 'Every state, honored', to: '/profile/resonance', proLock: proGated },
        { icon: BarChart3, label: 'Current Insights', description: 'Pattern visibility', to: '/profile/insights' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Gentle reminders', to: '/profile/notifications' },
        { icon: Palette, label: 'Theme', description: 'Dark or light mode' },
        { icon: Volume2, label: 'Audio', description: 'Sound and haptics' },
        { icon: CreditCard, label: 'Subscription', description: 'Plan and invoices', to: '/profile/subscription' },
        { icon: Download, label: 'Export & Backup', description: 'Save your data' },
        { icon: Info, label: 'About Inner Wake', description: 'Mission & philosophy', to: '/about' },
        { icon: Sparkles, label: 'About Soul Engineer', description: 'The ecosystem & DeWayne Woods', action: () => window.open('https://soulengineer.online', '_blank', 'noopener,noreferrer') },
      ],
    },
    ...(isAdmin ? [{ title: 'Admin', items: [{ icon: Shield, label: 'Admin Dashboard', description: 'Users & roles', to: '/admin', accent: true }] }] : []),
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
          {isFoundingMember && (
            <button
              type="button"
              onClick={() => navigate('/profile/subscription')}
              className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary/15"
            >
              <Sparkles size={11} strokeWidth={2} />
              Founding Member{detailedTier === 'lifetime' ? ' · Lifetime' : ''}
            </button>
          )}
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
            <p className="mt-1 text-xs text-muted-foreground font-heading italic">Your sigil is awakening · {cycleReturns} return{cycleReturns === 1 ? '' : 's'} this cycle</p>
          </motion.div>
        )}

        {/* Practice Constellation — replaces the numeric resets counter */}
        <motion.div variants={fadeUp}>
          <PracticeConstellation />
        </motion.div>


        {/* Sections */}
        <div className="space-y-4">
          {sectionGroups.map((group) => (
            <motion.section key={group.title} variants={fadeUp} className="space-y-2">
              <h2 className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60">{group.title}</h2>
              <div className="soul-glass overflow-hidden rounded-2xl divide-y divide-border/10">
                {group.items.map(({ icon: Icon, label, description, to, action, accent, proLock }: any) => (
                  <motion.button
                    key={label}
                    variants={fadeUp}
                    onClick={() => action ? action() : to && navigate(to)}
                    className={`flex min-h-[54px] w-full items-center gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-muted/10 active:scale-[0.99] sm:gap-4 sm:px-5 ${accent ? 'bg-primary/[0.03]' : ''}`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ? 'border border-primary/15 bg-primary/10' : 'border border-border/20 bg-muted/30'}`}>
                      <Icon size={18} className={accent ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <span className={`text-sm font-medium ${accent ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                      <br />
                      <span className="text-[11px] text-muted-foreground">{description}</span>
                    </div>
                    {proLock && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] font-medium text-primary">
                        <Lock size={9} strokeWidth={2} />
                        Pro
                      </span>
                    )}
                    {(to || action) && <ChevronRight size={14} className="shrink-0 text-muted-foreground/40" />}
                  </motion.button>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

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
          <a
            href="https://soulengineer.online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-primary transition-colors min-h-[44px]"
          >
            An app from Soul Engineer →
          </a>
          <p className="text-[10px] text-muted-foreground/40 leading-relaxed max-w-[18rem] mx-auto px-4">
            Inner Wake is part of a small ecosystem of practice tools by DeWayne Woods.
          </p>
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
