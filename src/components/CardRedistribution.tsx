import { useState } from "react";
import { useGame } from "@/game/store";
import { ItemType, ITEM_LABELS, ITEM_EMOJI, MAX_INVENTORY } from "@/game/types";
import { X } from "lucide-react";

const POWERUPS: ItemType[] = [
  "healing", "harming", "weakness", "swiftness", "invisibility", "goldenApple", "totem",
];

export function CardRedistribution({ onClose }: { onClose: () => void }) {
  const groups = useGame((s) => s.groups);
  const setInventory = useGame((s) => s.setInventory);
  const ranked = [...groups].sort((a, b) => b.hp + b.absorption - (a.hp + a.absorption));

  const [drafts, setDrafts] = useState<Record<string, { items: ItemType[]; milk: boolean }>>(
    Object.fromEntries(groups.map((g) => [g.id, { items: [], milk: false }]))
  );

  const toggleItem = (gid: string, item: ItemType) => {
    setDrafts((d) => {
      const cur = d[gid];
      const has = cur.items.includes(item);
      let items = has ? cur.items.filter((i) => i !== item) : [...cur.items, item];
      if (items.length > MAX_INVENTORY) items = items.slice(0, MAX_INVENTORY);
      return { ...d, [gid]: { ...cur, items } };
    });
  };

  const apply = () => {
    Object.entries(drafts).forEach(([gid, d]) => setInventory(gid, d.items, d.milk));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md overflow-auto p-4 flex items-start justify-center">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-5xl my-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-base text-bee-honey">🃏 Card Redistribution</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Groups ranked by HP+ABS. Distribute up to {MAX_INVENTORY} powerups + 1 milk per group.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {ranked.map((g, idx) => {
            const draft = drafts[g.id];
            return (
              <div key={g.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-7 w-7 rounded-lg flex items-center justify-center font-display text-xs ${
                      idx === 0 ? "bg-gradient-to-br from-bee-honey to-bee-amber text-black" : "bg-secondary"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-display text-sm">{g.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    HP {g.hp} • ABS {g.absorption}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {POWERUPS.map((it) => {
                    const active = draft.items.includes(it);
                    return (
                      <button
                        key={it}
                        onClick={() => toggleItem(g.id, it)}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                          active
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-background/40 border-border/40 hover:border-border"
                        }`}
                        title={ITEM_LABELS[it]}
                      >
                        <span className="text-xl">{ITEM_EMOJI[it]}</span>
                        <span className="text-[10px] uppercase truncate w-full text-center">{it}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.milk}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [g.id]: { ...d[g.id], milk: e.target.checked } }))
                      }
                      className="accent-bee-honey h-4 w-4"
                    />
                    🥛 Milk slot
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {draft.items.length}/{MAX_INVENTORY} powerups
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={apply}>Apply Distribution</button>
        </div>
      </div>
    </div>
  );
}
