import { create } from "zustand";
import {
  DEFAULT_STAGES,
  GameState,
  Group,
  ItemType,
  MAX_HP,
  MAX_INVENTORY,
  StageConfig,
  StatusEffect,
  stageForRound,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 9);

function makeGroup(name: string): Group {
  return {
    id: uid(),
    name,
    hp: MAX_HP,
    absorption: 0,
    effects: [],
    inventory: [],
    hasMilk: false,
    eliminated: false,
  };
}

interface Actions {
  setupGroups: (count: number, names?: string[]) => void;
  renameGroup: (id: string, name: string) => void;
  updateStage: (id: string, patch: Partial<StageConfig>) => void;
  setStages: (stages: StageConfig[]) => void;
  resetStages: () => void;
  applyWrong: (id: string) => void;
  applyCorrect: (id: string) => void;
  castItem: (userId: string, item: ItemType, targetId: string) => void;
  setInventory: (id: string, items: ItemType[], hasMilk: boolean) => void;
  nextRound: () => void;
  prevRound: () => void;
  setRound: (r: number) => void;
  startTiebreaker: () => void;
  declareWinner: (id: string) => void;
  resetGame: () => void;
  pushLog: (msg: string) => void;
  setQuestion: (round: number, question: string) => void;
}

const initialStages = DEFAULT_STAGES.map((s) => ({ ...s }));

const initialState: GameState = {
  groups: ["Group 1", "Group 2", "Group 3", "Group 4"].map(makeGroup),
  round: 1,
  totalRounds: initialStages[initialStages.length - 1].endRound,
  stages: initialStages,
  tiebreaker: false,
  winnerId: null,
  log: ["Game initialized."],
  questions: {},
};

function applyDamage(g: Group, amount: number): Group {
  let absorb = g.absorption;
  let hp = g.hp;
  let remaining = amount;
  if (absorb > 0) {
    const taken = Math.min(absorb, remaining);
    absorb -= taken;
    remaining -= taken;
  }
  if (remaining > 0) hp = Math.max(0, hp - remaining);
  return { ...g, hp, absorption: absorb };
}

export const useGame = create<GameState & Actions>((set, get) => ({
  ...initialState,

  pushLog: (msg) => set((s) => ({ log: [`R${s.round}: ${msg}`, ...s.log].slice(0, 80) })),

  setQuestion: (round, question) =>
    set((s) => ({
      questions: { ...s.questions, [round]: question },
    })),

  setupGroups: (count, names) => {
    const list: Group[] = [];
    for (let i = 0; i < count; i++) {
      const n = (names?.[i] ?? `Group ${i + 1}`).split(/\s+/).slice(0, 2).join(" ");
      list.push(makeGroup(n || `Group ${i + 1}`));
    }
    set({ groups: list, round: 1, tiebreaker: false, winnerId: null, log: [`Setup: ${count} groups.`] });
  },

  renameGroup: (id, name) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === id ? { ...g, name: name.split(/\s+/).slice(0, 2).join(" ") } : g
      ),
    })),

  updateStage: (id, patch) =>
    set((s) => {
      const stages = s.stages.map((st) => (st.id === id ? { ...st, ...patch } : st));
      const totalRounds = Math.max(...stages.map((st) => st.endRound));
      return { stages, totalRounds };
    }),

  setStages: (stages) =>
    set(() => ({
      stages,
      totalRounds: Math.max(...stages.map((st) => st.endRound)),
    })),

  resetStages: () =>
    set(() => ({
      stages: DEFAULT_STAGES.map((s) => ({ ...s })),
      totalRounds: DEFAULT_STAGES[DEFAULT_STAGES.length - 1].endRound,
    })),

  applyCorrect: (id) => {
    const g = get().groups.find((x) => x.id === id);
    if (g) get().pushLog(`✅ ${g.name} answered correctly.`);
  },

  applyWrong: (id) => {
    const s = get();
    const stage = stageForRound(s.round, s.stages);
    const base = stage.damage;
    set((st) => ({
      groups: st.groups.map((g) => {
        if (g.id !== id || g.eliminated) return g;
        const hasWeak = g.effects.includes("weakness");
        const dmg = base * (hasWeak ? 2 : 1);
        let next = applyDamage(g, dmg);
        if (next.hp <= 0 && g.inventory.includes("totem")) {
          const inv = [...g.inventory];
          inv.splice(inv.indexOf("totem"), 1);
          next = { ...next, hp: 1, absorption: next.absorption + 3, inventory: inv };
        }
        const effects: StatusEffect[] = next.effects.filter((e) => e !== "weakness");
        return { ...next, effects, eliminated: next.hp <= 0 };
      }),
    }));
    const g = get().groups.find((x) => x.id === id);
    if (g)
      get().pushLog(
        `❌ ${g.name} -${base}${
          g.effects.includes("weakness") ? " (×2 weakness)" : ""
        } HP. HP=${g.hp} ABS=${g.absorption}`
      );
  },

  castItem: (userId, item, targetId) => {
    const state = get();
    const user = state.groups.find((g) => g.id === userId);
    const target = state.groups.find((g) => g.id === targetId);
    if (!user || !target) return;

    set((st) => ({
      groups: st.groups.map((g) => {
        if (g.id === userId) {
          if (item === "milk") {
            g = { ...g, hasMilk: false };
          } else {
            const idx = g.inventory.indexOf(item);
            if (idx >= 0) {
              const inv = [...g.inventory];
              inv.splice(idx, 1);
              g = { ...g, inventory: inv };
            }
          }
        }
        if (g.id === targetId) {
          switch (item) {
            case "healing":
              g = { ...g, hp: Math.min(MAX_HP, g.hp + 3) };
              break;
            case "harming":
              g = applyDamage(g, 2);
              g = { ...g, eliminated: g.hp <= 0 };
              break;
            case "goldenApple":
              g = { ...g, absorption: g.absorption + 3 };
              break;
            case "totem":
              g = { ...g, absorption: g.absorption + 3 };
              break;
            case "weakness":
              if (!g.effects.includes("weakness")) g = { ...g, effects: [...g.effects, "weakness"] };
              break;
            case "swiftness":
              if (!g.effects.includes("swiftness")) g = { ...g, effects: [...g.effects, "swiftness"] };
              break;
            case "invisibility":
              if (!g.effects.includes("invisibility")) g = { ...g, effects: [...g.effects, "invisibility"] };
              break;
            case "milk":
              g = { ...g, effects: [], absorption: 0};
              break;
          }
        }
        return g;
      }),
    }));
    get().pushLog(`✨ ${user.name} used ${item} on ${target.name}.`);
  },

  setInventory: (id, items, hasMilk) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === id ? { ...g, inventory: items.slice(0, MAX_INVENTORY), hasMilk } : g
      ),
    })),

  nextRound: () =>
    set((s) => {
      const next = Math.min(s.totalRounds, s.round + 1);
      return {
        round: next,
        groups: s.groups.map((g) => ({ ...g, absorption: 0 })),
        log: [`▶ Round ${next} begins.`, ...s.log].slice(0, 80),
      };
    }),
  prevRound: () => set((s) => ({ round: Math.max(1, s.round - 1) })),
  setRound: (r) => set((s) => ({ round: Math.max(1, Math.min(s.totalRounds, r)) })),

  startTiebreaker: () =>
    set(() => ({ tiebreaker: true, log: ["⚔ WARDEN'S SONIC BOOM — TIEBREAKER!"] })),
  declareWinner: (id) => {
    const g = get().groups.find((x) => x.id === id);
    set({ winnerId: id });
    if (g) get().pushLog(`🏆 ${g.name} WINS THE BUZZY BEES!`);
  },
  resetGame: () =>
    set(() => ({
      ...initialState,
      stages: DEFAULT_STAGES.map((s) => ({ ...s })),
      groups: initialState.groups.map((g) => ({ ...g, id: uid() })),
    })),
}));
