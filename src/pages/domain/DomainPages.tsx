import DomainStateCheckIn from '@/components/domain/DomainStateCheckIn';
import DomainAffirmations from '@/components/domain/DomainAffirmations';
import DomainGatherFlow from '@/components/domain/DomainGatherFlow';
import DomainResistanceRelease from '@/components/domain/DomainResistanceRelease';
import DomainOpenings from '@/components/domain/DomainOpenings';
import DomainEvidence from '@/components/domain/DomainEvidence';
import { DOMAINS, DomainKey } from '@/lib/domains';

const make = (key: DomainKey) => ({
  State: () => <DomainStateCheckIn domain={DOMAINS[key]} />,
  Affirmations: () => <DomainAffirmations domain={DOMAINS[key]} />,
  Gather: () => <DomainGatherFlow domain={DOMAINS[key]} />,
  Resistance: () => <DomainResistanceRelease domain={DOMAINS[key]} />,
  Openings: () => <DomainOpenings domain={DOMAINS[key]} />,
  Evidence: () => <DomainEvidence domain={DOMAINS[key]} />,
});

export const SelfPages = make('self');
export const EnergyPages = make('energy');
export const RelationshipsPages = make('relationships');
export const HealthPages = make('health');
