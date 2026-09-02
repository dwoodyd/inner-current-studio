import CurrentRoom from '@/components/currents/CurrentRoom';
import { roomFor } from '@/lib/currentRooms';
import type { DomainConfig } from '@/lib/domains';

interface Props { domain: DomainConfig }

export default function DomainHub({ domain }: Props) {
  return <CurrentRoom domain={domain} room={roomFor(domain)} />;
}
