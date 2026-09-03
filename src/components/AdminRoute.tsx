import { ReactNode } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

/** Shared route-level guard for /admin/* screens. Pages may still self-gate. */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="font-heading text-xl text-foreground">Access denied</h1>
        <p className="text-sm text-muted-foreground">This area is limited to administrators.</p>
      </div>
    );
  }

  return <>{children}</>;
}
