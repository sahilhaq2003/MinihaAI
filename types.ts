
export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  EDITOR = 'EDITOR',
  PRICING = 'PRICING',
  HISTORY = 'HISTORY',
  DETECTOR = 'DETECTOR',
  PROFILE = 'PROFILE',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS'
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
  apiKey?: string;
}

export interface HistoryItem {
  id: string;
  original: string;
  humanized: string;
  tone: Tone;
  timestamp: number;
}

export interface SentenceDetection {
  sentence: string;
  aiProbability: number; // 0-100
  isHighlighted: boolean;
}

export interface DetectionResult {
  score: number; // 0 to 100 (AI probability)
  label: string; // "Human-Written" | "Mixed/Edited" | "Fully AI-Generated"
  analysis: string;
  sentences?: SentenceDetection[]; // Sentence-by-sentence analysis
  metrics?: {
    perplexity?: number;
    burstiness?: number;
    averageSentenceLength?: number;
    vocabularyRichness?: number;
  };
  detectedModels?: string[]; // Which AI models might have generated this
}

export interface EvaluationResult {
  humanScore: number;
  meaningPreserved: boolean;
  sentenceVariety: string;
  feedback: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: string;
  invoice: string;
}

export interface UserState {
  isLoggedIn: boolean;
  user?: UserProfile;
  isPremium: boolean;
  history: HistoryItem[];
}
