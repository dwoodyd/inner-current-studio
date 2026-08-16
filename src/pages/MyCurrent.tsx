import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useAppState } from '@/lib/AppContext';

type FilterType = 'all' | 'wheels' | 'sequences' | 'pages' | 'imagine' | 'overflow' | 'checkins';

const FILTER_LABELS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'wheels', label: 'Wheels' },
  { value: 'sequences', label: 'Sequences' },
  { value: 'pages', label: 'Pages' },
  { value: 'imagine', label: 'Imagine If' },
  { value: 'overflow', label: 'Overflow' },
  { value: 'checkins', label: 'Check-ins' },
];

export default function MyCurrent() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  type ArchiveItem = { type: string; title: string; date: string; preview?: string };

  const items: ArchiveItem[] = [];

  if (filter === 'all' || filter === 'wheels') {
    state.wheels.forEach(w => items.push({ type: 'Wheel', title: w.title, date: w.createdAt, preview: w.centerText }));
  }
  if (filter === 'all' || filter === 'sequences') {
    state.gatheredSequences.forEach(s => items.push({ type: 'Sequence', title: s.title, date: s.createdAt, preview: s.lines[0] }));
  }
  if (filter === 'all' || filter === 'pages') {
    state.futurePages.forEach(p => items.push({ type: 'Page', title: p.title, date: p.createdAt, preview: p.content.slice(0, 60) }));
  }
  if (filter === 'all' || filter === 'imagine') {
    state.imagineIfEntries.forEach(e => items.push({ type: 'Imagine If', title: e.category, date: e.createdAt, preview: e.text.slice(0, 60) }));
  }
  if (filter === 'all' || filter === 'overflow') {
    state.overflowEntries.forEach(e => items.push({ type: 'Overflow', title: e.mode, date: e.createdAt, preview: e.entryText.slice(0, 60) }));
  }
  if (filter === 'all' || filter === 'checkins') {
    state.checkIns.forEach(c => items.push({ type: 'Check-in', title: c.state, date: c.createdAt, preview: c.note }));
  }

  const filtered = search
    ? items.filter(i => (i.title + i.preview).toLowerCase().includes(search.toLowerCase()))
    : items;

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/reflect')} className="text-muted-foreground p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="font-heading text-lg font-semibold text-foreground">My Current</h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2">
        <Search size={14} className="text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your archive…"
          className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_LABELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filter === value ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet — that's a fine place to start"
          message="Everything you write, name, or soften lands in this library. One honest page is enough to open it."
          invitation="Your inner library begins with one honest page."
          action={{ label: 'Name how you feel', onClick: () => navigate('/') }}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="soul-card space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-primary/60">{item.type}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground capitalize">{item.title}</p>
              {item.preview && <p className="text-xs text-muted-foreground line-clamp-2">{item.preview}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
