import DomainHub from '@/components/domain/DomainHub';
import { DOMAINS } from '@/lib/domains';
export default function SelfHub() { return <DomainHub domain={DOMAINS.self} />; }
