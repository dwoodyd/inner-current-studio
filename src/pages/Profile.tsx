import { motion } from 'framer-motion';
import { useAppState } from '@/lib/AppContext';
import { BarChart3, Layers, Bell, Palette, Volume2, CreditCard, Download } from 'lucide-react';

export default function Profile() {
  const { state } = useAppState();
  const totalCheckIns = state.checkIns.length;
  const totalReturns = state.todayFlow.returnCount;

  const sections = [
    { icon: BarChart3, label: 'Current Insights', description: 'Pattern visibility', premium: true },
    { icon: Layers, label: 'My Rituals', description: 'Custom ritual sequences', premium: true },
    { icon: Bell, label: 'Notifications', description: 'Gentle reminders' },
    { icon: Palette, label: 'Theme', description: 'Dark or light mode' },
    { icon: Volume2, label: 'Audio', description: 'Sound and haptic settings' },
    { icon: CreditCard, label: 'Subscription', description: 'Manage your plan' },
    { icon: Download, label: 'Export & Backup', description: 'Save your data' },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Your practice, your way</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Check-ins', value: totalCheckIns },
          { label: 'Returns today', value: totalReturns },
          { label: 'Rituals', value: state.wheels.length + state.momentumSessions.length },
        ].map(({ label, value }) => (
          <div key={label} className="soul-card text-center py-4">
            <p className="text-lg font-heading font-semibold text-primary">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {sections.map(({ icon: Icon, label, description, premium }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/20 active:scale-[0.98]"
          >
            <Icon size={18} className="text-muted-foreground" strokeWidth={1.5} />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{label}</span>
                {premium && (
                  <span className="text-[9px] uppercase tracking-wider text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
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
