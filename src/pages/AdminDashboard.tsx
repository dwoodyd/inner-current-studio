import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Crown,
  UserCheck,
  User,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

const ROLE_META: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  admin: { icon: Crown, color: 'text-yellow-400', label: 'Admin' },
  moderator: { icon: ShieldCheck, color: 'text-blue-400', label: 'Moderator' },
  user: { icon: User, color: 'text-muted-foreground', label: 'User' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await supabase.functions.invoke('admin-users', {
        method: 'GET',
      });

      if (res.error) throw new Error(res.error.message);
      setUsers(res.data.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const addRole = async (userId: string, role: string) => {
    setActionLoading(`${userId}-add-${role}`);
    try {
      const res = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { user_id: userId, role },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Role "${role}" added`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const removeRole = async (userId: string, role: string) => {
    setActionLoading(`${userId}-rm-${role}`);
    try {
      const res = await supabase.functions.invoke('admin-users', {
        method: 'DELETE',
        body: { user_id: userId, role },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Role "${role}" removed`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background gap-4 px-6">
        <ShieldAlert size={48} className="text-destructive/60" />
        <h1 className="font-heading text-xl text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground text-center">You don't have admin privileges.</p>
        <button onClick={() => navigate('/')} className="text-sm text-primary underline mt-2">
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button onClick={() => navigate('/profile')} className="p-2 -ml-2 rounded-xl hover:bg-card/60 transition-colors">
            <ArrowLeft size={20} className="text-foreground/70" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <h1 className="font-heading text-lg font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="ml-auto p-2 rounded-xl hover:bg-card/60 transition-colors"
          >
            <RefreshCw size={16} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-28">
        <button
          onClick={() => navigate('/admin/founders')}
          className="soul-glass w-full rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-card/60 transition-colors text-left"
        >
          <Crown size={18} className="text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Founders Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Slots claimed, active plans, tiers, and recent founders.</p>
          </div>
          <span className="text-primary/60">→</span>
        </button>

        <button
          onClick={() => navigate('/admin/founding')}
          className="soul-glass w-full rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-card/60 transition-colors text-left"
        >
          <UserCheck size={18} className="text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Founding-Member Applications</p>
            <p className="text-[11px] text-muted-foreground">Review, approve, or reject hand-submitted entries.</p>
          </div>
          <span className="text-primary/60">→</span>
        </button>

        <button
          onClick={() => navigate('/admin/reading-bridge')}
          className="soul-glass w-full rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-card/60 transition-colors text-left"
        >
          <BookOpen size={18} className="text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Reading Bridge Analytics</p>
            <p className="text-[11px] text-muted-foreground">Track open / completion / dismissal across the cohort.</p>
          </div>
          <span className="text-primary/60">→</span>
        </button>



        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: users.length, icon: Users },
            { label: 'Admins', value: users.filter(u => u.roles.includes('admin')).length, icon: Crown },
            { label: 'Moderators', value: users.filter(u => u.roles.includes('moderator')).length, icon: ShieldCheck },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              className="soul-glass rounded-2xl p-4 text-center"
            >
              <stat.icon size={18} className="text-primary/60 mx-auto mb-2" />
              <p className="text-2xl font-heading font-semibold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* User list */}
        <div className="space-y-2">
          <h2 className="text-xs text-muted-foreground/50 uppercase tracking-widest px-1">All Users</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            </div>
          ) : (
            <AnimatePresence>
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="soul-glass rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                        {u.last_sign_in_at && ` · Last sign-in ${new Date(u.last_sign_in_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Current roles */}
                  <div className="flex flex-wrap gap-1.5">
                    {u.roles.length === 0 && (
                      <span className="text-[10px] text-muted-foreground/40 italic">No roles assigned</span>
                    )}
                    {u.roles.map((role) => {
                      const meta = ROLE_META[role] || ROLE_META.user;
                      const Icon = meta.icon;
                      const isRemoving = actionLoading === `${u.id}-rm-${role}`;
                      return (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 rounded-full bg-card/60 border border-border/20 px-2.5 py-1 text-[11px]"
                        >
                          <Icon size={11} className={meta.color} />
                          <span className={meta.color}>{meta.label}</span>
                          <button
                            onClick={() => removeRole(u.id, role)}
                            disabled={!!actionLoading}
                            className="ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors"
                            title={`Remove ${role}`}
                          >
                            {isRemoving ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Trash2 size={10} className="text-destructive/60" />
                            )}
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* Add role buttons */}
                  <div className="flex gap-1.5">
                    {(['admin', 'moderator', 'user'] as const)
                      .filter((r) => !u.roles.includes(r))
                      .map((role) => {
                        const meta = ROLE_META[role];
                        const isAdding = actionLoading === `${u.id}-add-${role}`;
                        return (
                          <button
                            key={role}
                            onClick={() => addRole(u.id, role)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/30 px-2.5 py-1 text-[10px] text-muted-foreground/50 hover:border-primary/30 hover:text-primary/60 transition-colors"
                          >
                            {isAdding ? (
                              <Loader2 size={9} className="animate-spin" />
                            ) : (
                              <Plus size={9} />
                            )}
                            Add {meta.label}
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
