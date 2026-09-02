import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Waves, RefreshCw, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { spring } from '@/lib/motion';

const tabs = [
  { to: '/', icon: Home, label: 'Home', match: ['/'] },
  { to: '/align', icon: Compass, label: 'Align', match: ['/align'] },
  { to: '/currents', icon: Waves, label: 'Currents', match: ['/currents', '/money', '/self', '/energy', '/relationships', '/health'] },
  { to: '/reset', icon: RefreshCw, label: 'Reset', match: ['/reset'] },
  { to: '/profile', icon: User, label: 'Profile', match: ['/profile', '/about', '/admin'] },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/80 backdrop-blur-2xl safe-bottom safe-x"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-0.5 pt-1 pb-0.5">
        {tabs.map(({ to, icon: Icon, label, match }) => {
          const isActive = match.some((path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
          return (
            <NavLink
              key={to}
              to={to}
              className="press relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[44px] px-1 py-1"
              aria-label={label}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary soul-glow-gold"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: 1, y: 0 } : { scale: 0.95, y: 0 }}
                whileTap={{ scale: 0.9 }}
                transition={spring.press}
              >
                <Icon
                  size={22}
                  className={`transition-colors duration-150 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </motion.div>
              <span
                className={`text-[10px] sm:text-[11px] font-medium leading-none transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-muted-foreground/50'
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
