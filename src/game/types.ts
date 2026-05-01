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

export type Stage = "silverfish" | "zombie" | "wither" | "warden";

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

export interface DamageConfig {
  silverfish: number;
  zombie: number;
  wither: number;
  warden: number;
}

export interface GameState {
  groups: Group[];
  round: number; // 1..31
  damage: DamageConfig;
  tiebreaker: boolean;
  winnerId: string | null;
  log: string[];
}

export const MAX_HP = 10;
export const MAX_INVENTORY = 3;
export const TOTAL_ROUNDS = 31;

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

export function stageForRound(r: number): Stage {
  if (r <= 9) return "silverfish";
  if (r <= 18) return "zombie";
  if (r <= 27) return "wither";
  return "warden";
}

export function timerForRound(r: number): number {
  switch (stageForRound(r)) {
    case "silverfish": return 15;
    case "zombie": return 30;
    case "wither": return 45;
    case "warden": return 60;
  }
}

export function stageLabel(s: Stage): string {
  return { silverfish: "Silverfish", zombie: "Zombie", wither: "Wither", warden: "Warden" }[s];
}
