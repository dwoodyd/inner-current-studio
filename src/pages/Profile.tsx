import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Layers, Sparkles, Activity, Bell, Palette, Volume2, CreditCard, Download, LogOut, ChevronRight } from 'lucide-react';

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
  const totalCheckIns = state.checkIns.length;
  const totalReturns = state.todayFlow.returnCount;
  const totalRituals = state.wheels.length + state.momentumSessions.length;

  const sections = [
    { icon: Sparkles, label: 'Current Guide', description: 'AI emotional companion', to: '/profile/guide', accent: true },
    { icon: Activity, label: 'Pattern Mirror', description: 'Your emotional rhythms', to: '/profile/patterns' },
    { icon: BarChart3, label: 'Current Insights', description: 'Pattern visibility', to: '/profile/insights' },
    { icon: Layers, label: 'My Rituals', description: 'Custom ritual sequences', to: '/profile/rituals' },
    { icon: Bell, label: 'Notifications', description: 'Gentle reminders', to: '/profile/notifications' },
    { icon: Palette, label: 'Theme', description: 'Dark or light mode' },
    { icon: Volume2, label: 'Audio', description: 'Sound and haptic settings' },
    { icon: CreditCard, label: 'Subscription', description: 'Manage your plan' },
    { icon: Download, label: 'Export & Backup', description: 'Save your data' },
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
        className="relative mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground font-heading italic">Your practice, your way</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: 'Check-ins', value: totalCheckIns },
            { label: 'Returns today', value: totalReturns },
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
          {sections.map(({ icon: Icon, label, description, to, accent }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              onClick={() => to && navigate(to)}
              className={`w-full flex items-center gap-4 px-5 py-4 transition-all hover:bg-muted/10 active:scale-[0.99] ${
                accent ? 'bg-primary/[0.03]' : ''
              }`}
              whileTap={{ scale: 0.99 }}
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                accent
                  ? 'bg-primary/10 border border-primary/15'
                  : 'bg-muted/30 border border-border/20'
              }`}>
                <Icon
                  size={16}
                  className={accent ? 'text-primary' : 'text-muted-foreground'}
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 text-left">
                <span className={`text-sm font-medium ${accent ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                <br />
                <span className="text-[11px] text-muted-foreground">{description}</span>
              </div>
              {to && <ChevronRight size={14} className="text-muted-foreground/40" />}
            </motion.button>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.button
          variants={fadeUp}
          onClick={signOut}
          className="w-full soul-glass rounded-2xl flex items-center justify-center gap-2 px-4 py-3.5 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all active:scale-[0.98]"
        >
          <LogOut size={15} />
          Sign Out
        </motion.button>

        {/* Footer */}
        <motion.div variants={fadeUp} className="text-center pt-2 space-y-1.5">
          <p className="text-[10px] text-muted-foreground/40 truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground/50">SoulCurrent v1.0</p>
          <p className="text-xs text-muted-foreground/30 font-heading italic">Return to your inner current</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
