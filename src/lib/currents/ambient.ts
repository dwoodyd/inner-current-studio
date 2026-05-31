// Per-current ambient audio pads, generated live with WebAudio.
// No external assets required. Each current gets a distinct timbre.

import type { DomainKey } from '@/lib/domains';

type Profile = {
  base: number;          // base hz
  fifth: number;         // companion hz
  filterHz: number;      // low-pass cutoff
  lfoHz: number;         // gentle amplitude wobble
  oscType: OscillatorType;
};

const PROFILES: Record<DomainKey, Profile> = {
  money:        { base: 110.0, fifth: 164.81, filterHz: 900,  lfoHz: 0.07, oscType: 'sine'     },
  self:         { base: 138.59, fifth: 207.65, filterHz: 1100, lfoHz: 0.05, oscType: 'triangle' },
  energy:       { base: 174.61, fifth: 261.63, filterHz: 1600, lfoHz: 0.15, oscType: 'sawtooth' },
  relationships:{ base: 196.00, fifth: 246.94, filterHz: 1200, lfoHz: 0.08, oscType: 'sine'     },
  health:       { base: 96.00,  fifth: 144.00, filterHz: 800,  lfoHz: 0.04, oscType: 'sine'     },
};

export class CurrentAmbient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private running = false;

  constructor(private slug: DomainKey) {}

  async start(targetGain = 0.07) {
    if (this.running) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();
    if (ctx.state === 'suspended') await ctx.resume();
    this.ctx = ctx;
    const p = PROFILES[this.slug];

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = p.filterHz;
    filter.Q.value = 0.7;
    filter.connect(master);

    const make = (freq: number, detune = 0, gain = 0.5) => {
      const osc = ctx.createOscillator();
      osc.type = p.oscType;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(filter);
      osc.start();
      this.nodes.push(osc, g);
    };
    make(p.base, -6, 0.55);
    make(p.base, +6, 0.45);
    make(p.fifth, 0, 0.32);

    // gentle LFO on master for breathing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = p.lfoHz;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = targetGain * 0.35;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();
    this.nodes.push(lfo, lfoGain);

    // fade in
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(targetGain, now + 2.5);
    this.running = true;
  }

  async stop() {
    if (!this.running || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const master = this.master;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    await new Promise((r) => setTimeout(r, 1500));
    for (const n of this.nodes) {
      try { (n as OscillatorNode).stop?.(); } catch {}
      try { n.disconnect(); } catch {}
    }
    this.nodes = [];
    try { await ctx.close(); } catch {}
    this.ctx = null;
    this.master = null;
    this.running = false;
  }
}
