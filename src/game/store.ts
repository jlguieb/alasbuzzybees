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
  questions: {
  1: "A test has high reliability but low validity in measuring scientific reasoning. What is the BEST interpretation? \n\n A. The test is inconsistent but measures the right skill \n B. The test is consistent but measures the wrong construct \n C. The test is both invalid and unreliable \n D. The test measures multiple constructs accurately",
  2: "In Java, what is the code to print out the third element in the array: int array = (1, 2, 3, 4, 5) \n\n A. System.out.println(array[3]); \n B. System.out.println(array[2]); \n C. print(array[1]) \n D. print(array[0])",
  3: "What is the Sl unit of magnetic flux? \n\n A. Weber \n B. Maxwell \n C. Tesla \n D. Gauss",
  4: "Which situation best reflects \"low validity but high reliability\"? \n\n A. A test consistently measures creativity instead of math ability \n B. A test gives random scores every time \n C. A test changes difficulty every administration \n D. A test measures multiple unrelated skills inconsistently",
  5: "In Data Science, what does \"DBMS\" stand for? \n\n A. Database Management Systems \n B. Data Backup Management Systems \n C. Digital Base Memory System \n D. Data Block Main Server",
  6: "The eight major taxonomic levels from broadest to smallest are: \n\n A. Kingdom, Domain, Phylum, Class, Order, Genus, Family, Species \n B. Domain, Kingdom, Phylum, Class, Family, Order, Genus, Species \n C. Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species \n D. Domain, Kingdom, Phylum, Order, Class, Family, Genus, Species",
  7: "In genetics, what is the word used to describe the appearance of an individual without regard for its hereditary constitution? \n\n A. Genotype \n B. Phenotype \n C. Allele \n D. Karyotype",
  8: "A block slides down a frictionless incline of angle 0. Which quantity remains constant during the motion? \n\n A. Velocity \n B. Potential Energy \n C. Mechanical Energy \n D. Acceleration",
  9: "The entropy of the universe. \n\n A. stays the same \n B. always decreases \n C. is zero \n D. always increases",
  10: "What is the name of the first cloned mammal created from an adult cell, whose birth in 1996 revolutionized the field of genetics? \n\n A. Dolly \n B. Laika \n C. Washoe \n D. Dotcom",
  11: "In Boolean Algebra, which specific logic gate returns true (or 1) only when the number of true inputs is odd? \n\n A. XOR (Exclusive OR) \n B. AND \n C. OR \n D. NOR (Not Or)",
  12: "Why do students often fail to transfer math skills to chemistry stoichiometry? \n\n A. Lack of memorization \n B. Domain-specific encoding of knowledge \n C. Poor handwriting skills \n D. Overuse of calculators",
  13: "What type of sorting algorithm uses an 0 (n log n) time complexity? \n\n A. Insertion Sort \n B. Bubble Sort \n C. Merge Sort \n D. Bucket Sort",
  14: "The oxidation number of sulfur in H2S04 is: \n\n A. +4 \n B. +6 \n C. -2 \n D. +2",
  15: "Which theory best explains students' resistance to correcting misconceptions in physics? \n\n A. Behaviorism \n B. Cognitive load theory \n C. Conceptual change theory \n D. Social learning theory",
  16: "Segmentation of the body is not represented in \n\n A. Crayfish \n B. Grasshopper \n C. Star fish \n D. Frogs",
  17: "In a Global Navigation Satellite System (GNSS), such as GPS, what is the minimum number of satellites required to determine a 3D position (latitude, longitude, and altitude)? \n\n A. 2 \n B. 3 \n C. 4 \n D. 5",
  18: "A geostationary satellite completes one orbit in approximately \n\n A. 1 hour \n B. 5 hours \n C. 12 hours \n D. 24 hours",
  19: "In a concrete internal support for a continuous slab, what type of force is the top part of the concrete with respect to its neutral axis being subjected under? \n\n A. Compression \n B. Tension \n C. Positive shear \n D. Negative shear",
  20: "A teacher scaffolds a complex stoichiometry task by splitting it into sequential subtasks. Which cognitive principle BEST explains why this improves performance? \n\n A. Dual coding theory \n B. Reduction of extraneous cognitive load \n C. Distributed retrieval practice \n D. Operant conditioning",
  21: "What is the name of the data structure that follows the Last-In, First-Out (LIFO) principle? \n\n A. Arrays \n B. Queue \n C. Stack \n D. Binary trees",
  22: "A student solving a projectile motion problem treats horizontal acceleration as constant and nonzero despite repeated correction. According to conceptual change theory, the MOST likely reason is: \n\n A. Failure of procedural encoding \n B. Presence of a deeply rooted intuitive framework \n C. Weak long-term memory consolidation \n D. Inadequate reinforcement schedule",
  23: "In fields such as geomatics and astronomy, what mathematical shape is used as a simplified reference model of the Earth to enable consistent positioning and computation, despite its irregular physical shape?",
  24: "What is the specific name for the error that occurs when a recursive function fails to reach its base case, eventually consuming all the memory allocated for the function call stack? \n\n A. Stack malfunctioning \n B. Stack overload \n C. Stack error \n D. Stack corruption",
  25: "Which theorem converts a network of passive components into a voltage divider identity for simplified calculations of the load features? \n\n A. Thevenin's Theorem \n B. Norton's Theorem \n C. Superposition Theorem \n D. Millman's Theorem",
  26: "What is the term for the process by which one group of cells influences the fate and development of another group through the release of signaling molecules, leading to tissue differentiation? \n\n A. Cell Division \n B. Osmosis \n C. Apoptosis \n D. Induction",
  27: "A physics class shows confusion in Newton's 2nd Law in elevators. Best cause? \n\n A. Misreading graphs \n B. Non-inertial reference frame misunderstanding \n C. Poor algebra skills \n D. Lack of calculators",
  28: "What is the measure of a differential amplifier's ability to reject unwanted signals (noise or interference) present simultaneously and in-phase on both inputs?",
  29: "List the three code lines (i.e., line 1, line 4, & line 7) that contain syntax and logical errors in the Java code shown: \n 1 public static void main(String [] args){ \n 2 String personToFind = \"Denise\"; \n 3 String [] names = {\"Jeff\", \"Gianfranco\", \"Denise\", \"Maxinne\"}; \n 4 int personIndex = 0; \n 5 \n 6 for (int $i=0$; i < names.length; i++);{ \n 7 if (personToFind == names[i]) { \n 8 personIndex = i; \n 9 } \n 10 \n 11 System.out.println(\"Person is found at \" + i); \n 12 }",
  30: "In calculating the design capacity of a structural member, civil engineers use two methods: ASD and LRFD. Give the meaning of both acronyms.",
  31: "In 1967 the SI unit for time, second (s), was defined by the frequency of a certain isotope. What isotope is this?"
},
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
