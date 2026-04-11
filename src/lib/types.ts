export type EmotionalState =
  | 'shut-down' | 'raw' | 'tense' | 'discouraged' | 'scattered'
  | 'doubtful' | 'restless' | 'flat' | 'neutral' | 'open'
  | 'steady' | 'hopeful' | 'uplifted' | 'clear' | 'energized' | 'flowing';

export type QuickState = 'tight' | 'restless' | 'flat' | 'open' | 'flowing';

export type BelievabilityLevel = 'forced' | 'possible' | 'believable' | 'true' | 'alive';

export type VibeCheck = 'expansive' | 'mixed' | 'heavy';

export type ChargeLevel = 'intense' | 'active' | 'softening' | 'lighter' | 'open';

export type ResistanceTrigger =
  | 'fear' | 'urgency' | 'doubt' | 'shame' | 'disappointment'
  | 'control' | 'pressure' | 'comparison' | 'impatience'
  | 'heaviness' | 'mental-noise' | 'emotional-charge';

export type BodyLocation =
  | 'thoughts' | 'chest' | 'throat' | 'belly' | 'jaw'
  | 'shoulders' | 'hands' | 'everywhere';

export type ClearingMode = 'breathe' | 'soften-thought' | 'let-it-be' | 'move-energy';

export type ChargeType =
  | 'fearful' | 'urgent' | 'ashamed' | 'controlling'
  | 'disappointed' | 'defeated' | 'scattered';

export interface CheckIn {
  id: string;
  state: EmotionalState;
  note?: string;
  createdAt: string;
}

export interface WheelSegment {
  index: number;
  prompt: string;
  response: string;
  believability: BelievabilityLevel;
}

export interface Wheel {
  id: string;
  title: string;
  centerText: string;
  segments: WheelSegment[];
  type: 'alignment' | 'relief';
  completionStatus: 'draft' | 'in-progress' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export interface GatheredSequence {
  id: string;
  title: string;
  lines: string[];
  playbackSettings: {
    speed: number;
    mode: 'text' | 'audio' | 'both';
    voiceEnabled?: boolean;
    soundEnabled?: boolean;
    selectedSound?: string;
    volume?: number;
  };
  createdAt: string;
}

export interface MomentumSession {
  id: string;
  phrase: string;
  duration: number;
  completed: boolean;
  createdAt: string;
}

export interface FuturePage {
  id: string;
  title: string;
  template: string;
  content: string;
  vibeCheck?: VibeCheck;
  createdAt: string;
}

export interface ImagineIfEntry {
  id: string;
  category: string;
  text: string;
  createdAt: string;
}

export interface OverflowEntry {
  id: string;
  mode: string;
  resourceAmount: string;
  entryText: string;
  feelingText: string;
  resistanceNote: string;
  createdAt: string;
}

export interface CustomRitual {
  id: string;
  name: string;
  steps: string[];
  durationEstimate: number;
  createdAt: string;
}

export interface ResistanceEntry {
  id: string;
  triggerType: ResistanceTrigger;
  bodyLocation: BodyLocation;
  chargeBefore: ChargeLevel;
  chargeAfter: ChargeLevel;
  clearingMode: ClearingMode;
  softenedStatement?: string;
  createdAt: string;
}

export interface ThoughtShift {
  id: string;
  originalThought: string;
  chargeType: ChargeType;
  softerStatement: string;
  believableStatement: string;
  supportStatement: string;
  createdAt: string;
}

export interface TodayFlow {
  morningRitual: boolean;
  resetUsed: boolean;
  reflectionCompleted: boolean;
  momentumCompleted: boolean;
  returnCount: number;
}

export interface OnboardingData {
  reason?: string;
  style?: string;
  challenge?: string;
  completed: boolean;
}

export interface AppState {
  onboarding: OnboardingData;
  checkIns: CheckIn[];
  wheels: Wheel[];
  gatheredSequences: GatheredSequence[];
  momentumSessions: MomentumSession[];
  futurePages: FuturePage[];
  imagineIfEntries: ImagineIfEntry[];
  overflowEntries: OverflowEntry[];
  customRituals: CustomRitual[];
  resistanceEntries: ResistanceEntry[];
  thoughtShifts: ThoughtShift[];
  todayFlow: TodayFlow;
  lastVisit: string;
}
