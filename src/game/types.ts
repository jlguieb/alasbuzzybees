export type ItemType =
  | "healing"
  | "harming"
  | "weakness"
  | "swiftness"
  | "invisibility"
  | "goldenApple"
  | "totem"
  | "milk";

export type StatusEffect = "weakness" | "swiftness" | "invisibility";

export type StageId = "silverfish" | "zombie" | "wither" | "warden";

export interface StageConfig {
  id: StageId;
  label: string;
  startRound: number; // inclusive
  endRound: number;   // inclusive
  timer: number;      // seconds
  damage: number;
  color: string;      // tailwind/HSL semantic key
  emoji: string;
}

export interface Group {
  id: string;
  name: string;
  hp: number;
  absorption: number;
  effects: StatusEffect[];
  inventory: ItemType[]; // max 3 powerups
  hasMilk: boolean;
  eliminated: boolean;
}

export interface GameState {
  groups: Group[];
  round: number;
  totalRounds: number;
  stages: StageConfig[];
  tiebreaker: boolean;
  winnerId: string | null;
  log: string[];
  questions: Record<number, string>; // questions keyed by round number
}

export const MAX_HP = 10;
export const MAX_INVENTORY = 3;

export const DEFAULT_STAGES: StageConfig[] = [
  { id: "silverfish", label: "Silverfish", startRound: 1,  endRound: 9,  timer: 15, damage: 1,   color: "stage-silverfish", emoji: "🪲" },
  { id: "zombie",     label: "Zombie",     startRound: 10, endRound: 18, timer: 30, damage: 1.5, color: "stage-zombie",     emoji: "🧟" },
  { id: "wither",     label: "Wither",     startRound: 19, endRound: 27, timer: 45, damage: 2,   color: "stage-wither",     emoji: "💀" },
  { id: "warden",     label: "Warden",     startRound: 28, endRound: 31, timer: 60, damage: 3,   color: "stage-warden",     emoji: "👁" },
];

export const ITEM_LABELS: Record<ItemType, string> = {
  healing: "Potion of Healing",
  harming: "Potion of Harming",
  weakness: "Potion of Weakness",
  swiftness: "Potion of Swiftness",
  invisibility: "Potion of Invisibility",
  goldenApple: "Golden Apple",
  totem: "Totem of Undying",
  milk: "Bucket of Milk",
};

export const ITEM_EMOJI: Record<ItemType, string> = {
  healing: "🧪",
  harming: "☠️",
  weakness: "🍶",
  swiftness: "💨",
  invisibility: "👻",
  goldenApple: "🍎",
  totem: "🗿",
  milk: "🥛",
};

export function stageForRound(r: number, stages: StageConfig[]): StageConfig {
  return (
    stages.find((s) => r >= s.startRound && r <= s.endRound) ??
    stages[stages.length - 1]
  );
}
