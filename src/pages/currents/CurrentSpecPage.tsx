// Route wrapper for the per-current spec layout (hero + sigil + sequences + beliefs).
// SOON currents are intercepted by PremiumGate's "coming soon" state so the gate
// holds even when a user lands here via direct URL or the weekly digest.
import { useParams } from 'react-router-dom';
import CurrentLayout from '@/components/currents/CurrentLayout';
import { PremiumGate } from '@/components/PremiumGate';

export default function CurrentSpecPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <PremiumGate domain={slug}>
      <CurrentLayout />
    </PremiumGate>
  );
}
