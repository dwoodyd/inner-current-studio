// Route wrapper for the Guided Sequence Runner. Same SOON gate as the spec page.
import { useParams } from 'react-router-dom';
import GuidedSequenceRunner from '@/components/currents/GuidedSequenceRunner';
import { PremiumGate } from '@/components/PremiumGate';

export default function CurrentSequencePage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <PremiumGate domain={slug}>
      <GuidedSequenceRunner />
    </PremiumGate>
  );
}
