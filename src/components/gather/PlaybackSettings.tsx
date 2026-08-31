import { Switch } from '@/components/ui/switch';
import { SOUND_OPTIONS, type SoundOption } from '@/lib/sounds';
import { Volume2, Mic, VolumeX } from 'lucide-react';

export interface PlaybackConfig {
  voiceEnabled: boolean;
  soundEnabled: boolean;
  selectedSound: string;
  volume: number;
}

interface Props {
  config: PlaybackConfig;
  onChange: (config: PlaybackConfig) => void;
}

const natureSounds = SOUND_OPTIONS.filter(s => s.category === 'nature');
const meditationSounds = SOUND_OPTIONS.filter(s => s.category === 'meditation');

export function PlaybackSettings({ config, onChange }: Props) {
  const set = (partial: Partial<PlaybackConfig>) => onChange({ ...config, ...partial });

  return (
    <div className="space-y-4 soul-glass rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">Playback Options</p>

      {/* Voice toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Mic size={14} className="text-primary/60" />
          <div>
            <p className="text-xs font-medium text-foreground">Voice reads affirmations</p>
            <p className="text-[10px] text-muted-foreground/50">Device voice speaks each thought aloud</p>
          </div>
        </div>
        <Switch checked={config.voiceEnabled} onCheckedChange={v => set({ voiceEnabled: v })} />
      </div>

      {/* Sound toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Volume2 size={14} className="text-primary/60" />
          <div>
            <p className="text-xs font-medium text-foreground">Background sound</p>
            <p className="text-[10px] text-muted-foreground/50">Ambient music during playback</p>
          </div>
        </div>
        <Switch checked={config.soundEnabled} onCheckedChange={v => set({ soundEnabled: v })} />
      </div>

      {/* Sound picker */}
      {config.soundEnabled && (
        <div className="space-y-3 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Volume slider */}
          <div className="flex items-center gap-3">
            <VolumeX size={12} className="text-muted-foreground/40" />
            <input
              type="range"
              aria-label="Playback volume"
              min={0}
              max={100}
              value={config.volume * 100}
              onChange={e => set({ volume: Number(e.target.value) / 100 })}
              className="flex-1 h-1 accent-primary bg-muted/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <Volume2 size={12} className="text-muted-foreground/40" />
          </div>

          {/* Nature */}
          <SoundGroup label="Nature" sounds={natureSounds} selected={config.selectedSound} onSelect={id => set({ selectedSound: id })} />
          {/* Meditation */}
          <SoundGroup label="Meditation" sounds={meditationSounds} selected={config.selectedSound} onSelect={id => set({ selectedSound: id })} />
        </div>
      )}

      {/* Silent mode note */}
      {!config.voiceEnabled && !config.soundEnabled && (
        <p className="text-[10px] text-muted-foreground/40 italic text-center pt-1">
          Silent mode — read and repeat each thought yourself.
        </p>
      )}
    </div>
  );
}

function SoundGroup({ label, sounds, selected, onSelect }: { label: string; sounds: SoundOption[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {sounds.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] transition-all duration-200 ${
              selected === s.id
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'soul-glass text-muted-foreground hover:text-foreground/70'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
