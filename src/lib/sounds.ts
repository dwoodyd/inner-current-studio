/**
 * Ambient Sound Engine — generates meditation & nature sounds
 * using the Web Audio API. No external files needed.
 */

export interface SoundOption {
  id: string;
  name: string;
  category: 'nature' | 'meditation';
  description: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  // Nature
  { id: 'rain', name: 'Gentle Rain', category: 'nature', description: 'Soft rainfall' },
  { id: 'ocean', name: 'Ocean Waves', category: 'nature', description: 'Rolling waves' },
  { id: 'wind', name: 'Soft Wind', category: 'nature', description: 'Calm breeze' },
  { id: 'stream', name: 'Forest Stream', category: 'nature', description: 'Flowing water' },
  // Meditation
  { id: 'bowl', name: 'Singing Bowl', category: 'meditation', description: 'Tibetan bowl tone' },
  { id: 'drone', name: 'Soft Drone', category: 'meditation', description: 'Deep harmonic hum' },
  { id: 'chimes', name: 'Wind Chimes', category: 'meditation', description: 'Gentle chimes' },
  { id: 'binaural', name: 'Binaural Calm', category: 'meditation', description: 'Alpha wave tones' },
];

let audioCtx: AudioContext | null = null;
let activeNodes: AudioNode[] = [];
let activeSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function createNoiseBuffer(ctx: AudioContext, seconds: number, type: 'white' | 'brown' | 'pink' = 'white'): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (type === 'pink') {
        // Simple pink approximation
        lastOut = 0.99765 * lastOut + white * 0.0555179;
        data[i] = lastOut * 0.5;
      } else {
        data[i] = white;
      }
    }
  }
  return buffer;
}

function startNoise(ctx: AudioContext, gain: GainNode, type: 'white' | 'brown' | 'pink', filterFreq: number, filterQ: number = 1) {
  const buffer = createNoiseBuffer(ctx, 4, type);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = filterQ;

  source.connect(filter);
  filter.connect(gain);
  source.start();
  activeSource = source;
  activeNodes.push(source, filter);
}

function startSingingBowl(ctx: AudioContext, gain: GainNode) {
  const fundamentals = [261.63, 392, 523.25]; // C4, G4, C5
  fundamentals.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.08 / (i + 1);

    // Slow tremolo for bowl character
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15 + i * 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;

    lfo.connect(lfoGain);
    lfoGain.connect(oscGain.gain);

    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.start();
    lfo.start();
    activeNodes.push(osc, oscGain, lfo, lfoGain);
  });
}

function startDrone(ctx: AudioContext, gain: GainNode) {
  const freqs = [110, 165, 220, 330]; // A2, E3, A3, E4
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i < 2 ? 'sine' : 'triangle';
    osc.frequency.value = freq;

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.06 / (i + 1);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    activeNodes.push(osc, oscGain);
  });
}

function startChimes(ctx: AudioContext, gain: GainNode) {
  // Random chime hits on a gentle loop
  const chimeFreqs = [880, 1174.66, 1318.51, 1567.98, 2093]; // high bell-like tones
  const scheduleChime = () => {
    if (!audioCtx || audioCtx.state === 'closed') return;
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

    osc.connect(env);
    env.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3);
    activeNodes.push(osc, env);
  };

  // Schedule chimes at random intervals
  const interval = setInterval(() => {
    if (!audioCtx || audioCtx.state === 'closed') {
      clearInterval(interval);
      return;
    }
    scheduleChime();
  }, 2000 + Math.random() * 3000);
  scheduleChime(); // first one immediately

  // Store cleanup
  (gain as any).__chimeInterval = interval;
}

function startBinaural(ctx: AudioContext, gain: GainNode) {
  // 200Hz base, 10Hz difference → alpha wave
  const left = ctx.createOscillator();
  left.type = 'sine';
  left.frequency.value = 200;

  const right = ctx.createOscillator();
  right.type = 'sine';
  right.frequency.value = 210;

  const merger = ctx.createChannelMerger(2);
  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.12;

  left.connect(merger, 0, 0);
  right.connect(merger, 0, 1);
  merger.connect(oscGain);
  oscGain.connect(gain);

  left.start();
  right.start();
  activeNodes.push(left, right, merger, oscGain);
}

export function startSound(soundId: string, volume: number = 0.5): void {
  stopSound(); // stop previous
  const ctx = getCtx();
  gainNode = ctx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(ctx.destination);

  switch (soundId) {
    case 'rain':
      startNoise(ctx, gainNode, 'brown', 800, 0.5);
      break;
    case 'ocean':
      startNoise(ctx, gainNode, 'brown', 400, 2);
      // Add wave-like volume modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = volume * 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfo.start();
      activeNodes.push(lfo, lfoGain);
      break;
    case 'wind':
      startNoise(ctx, gainNode, 'pink', 600, 0.3);
      break;
    case 'stream':
      startNoise(ctx, gainNode, 'white', 2000, 0.2);
      gainNode.gain.value = volume * 0.3;
      break;
    case 'bowl':
      startSingingBowl(ctx, gainNode);
      break;
    case 'drone':
      startDrone(ctx, gainNode);
      break;
    case 'chimes':
      startChimes(ctx, gainNode);
      break;
    case 'binaural':
      startBinaural(ctx, gainNode);
      break;
  }
}

export function setVolume(vol: number): void {
  if (gainNode) {
    gainNode.gain.linearRampToValueAtTime(vol, (audioCtx?.currentTime ?? 0) + 0.1);
  }
}

export function stopSound(): void {
  if (gainNode && (gainNode as any).__chimeInterval) {
    clearInterval((gainNode as any).__chimeInterval);
  }
  activeNodes.forEach(node => {
    try {
      if ('stop' in node && typeof (node as any).stop === 'function') (node as any).stop();
      node.disconnect();
    } catch { /* already stopped */ }
  });
  activeNodes = [];
  activeSource = null;
  if (gainNode) {
    try { gainNode.disconnect(); } catch { /* ok */ }
    gainNode = null;
  }
}

/**
 * Web Speech API — speak text aloud
 */
export function speakText(text: string, rate: number = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      resolve(); // silently skip if unavailable
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.95;
    utterance.volume = 1;

    // Try to find a calmer voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Karen') ||
      v.name.includes('Google UK English Female') || v.name.includes('Google US English')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // don't block on error
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
