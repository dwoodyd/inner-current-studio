import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/AppContext';
import { BarChart3, Layers, Sparkles, Activity, Bell, Palette, Volume2, CreditCard, Download } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const totalCheckIns = state.checkIns.length;
  const totalReturns = state.todayFlow.returnCount;

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
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="font-heading text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Your practice, your way</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Check-ins', value: totalCheckIns },
          { label: 'Returns today', value: totalReturns },
          { label: 'Rituals', value: state.wheels.length + state.momentumSessions.length },
        ].map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="soul-card-raised text-center py-4"
          >
            <p className="text-lg font-heading font-semibold text-primary">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-1">
        {sections.map(({ icon: Icon, label, description, to, accent }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            onClick={() => to && navigate(to)}
            className={`w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-muted/20 active:scale-[0.98] ${
              accent ? 'bg-primary/5 border border-primary/10' : ''
            }`}
          >
            <Icon
              size={18}
              className={accent ? 'text-primary' : 'text-muted-foreground'}
              strokeWidth={1.5}
            />
            <div className="flex-1 text-left">
              <span className={`text-sm font-medium ${accent ? 'text-primary' : 'text-foreground'}`}>{label}</span>
              <br />
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center pt-4 space-y-1">
        <p className="text-xs text-muted-foreground/50">SoulCurrent v1.0</p>
        <p className="text-xs text-muted-foreground/40 font-heading italic">Return to your inner current</p>
      </div>
    </div>
  );
}
