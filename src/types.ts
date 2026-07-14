export type AppMode = 'integer' | 'decimal' | 'dice' | 'coin' | 'decision';

export interface IntegerSettings {
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
  sort: 'none' | 'asc' | 'desc';
}

export interface DecimalSettings {
  min: number;
  max: number;
  count: number;
  decimalPlaces: number;
}

export interface CoinStats {
  heads: number;
  tails: number;
  total: number;
}

export type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface DiceSettings {
  diceType: DiceType;
  customSides: number;
  isCustom: boolean;
  count: number;
}

export interface DecisionSettings {
  options: string[];
  drawCount: number;
  allowDuplicates: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  mode: AppMode;
  summary: string; // Brief description, e.g. "Integer (1-100)" or "Coin Flip"
  results: string[]; // List of string representation of results
}
