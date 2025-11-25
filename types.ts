
export enum View {
  EDITOR = 'EDITOR',
  PRICING = 'PRICING',
  HISTORY = 'HISTORY',
  DETECTOR = 'DETECTOR'
}

export enum Tone {
  STANDARD = 'Standard',
  CASUAL = 'Casual',
  PROFESSIONAL = 'Professional',
  ACADEMIC = 'Academic',
  WITTY = 'Witty',
  EMPATHETIC = 'Empathetic',
  PERSUASIVE = 'Persuasive'
}

export enum Vocabulary {
  SIMPLE = 'Simple (High School)',
  STANDARD = 'Standard (College)',
  ADVANCED = 'Advanced (PhD)'
}

export interface HumanizeOptions {
  tone: Tone;
  vocabulary: Vocabulary;
  intensity: number; // 0-100
}

export interface HistoryItem {
  id: string;
  original: string;
  humanized: string;
  tone: Tone;
  timestamp: number;
}

export interface DetectionResult {
  score: number; // 0 to 100
  label: string;
  analysis: string;
}

export interface EvaluationResult {
  humanScore: number;
  meaningPreserved: boolean;
  sentenceVariety: string;
  feedback: string;
}

export interface UserState {
  isPremium: boolean;
  history: HistoryItem[];
}
