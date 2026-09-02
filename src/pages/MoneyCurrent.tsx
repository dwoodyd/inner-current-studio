import CurrentRoom from '@/components/currents/CurrentRoom';
import { DOMAINS } from '@/lib/domains';
import { MONEY_ROOM } from '@/lib/currentRooms';

export default function MoneyCurrent() {
  return <CurrentRoom domain={DOMAINS.money} room={MONEY_ROOM} />;
}
