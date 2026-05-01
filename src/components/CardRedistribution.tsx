import { useState } from "react";
import { useGame } from "@/game/store";
import { ItemType, ITEM_LABELS, ITEM_EMOJI, MAX_INVENTORY } from "@/game/types";

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
    <div className="fixed inset-0 z-50 bg-black/80 overflow-auto p-4 flex items-start justify-center">
      <div className="mc-panel mc-panel-stone p-5 w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-mc-gold text-base">🃏 Card Redistribution</h2>
          <button className="mc-btn" onClick={onClose}>Close</button>
        </div>
        <p className="font-pixel text-base mb-4 opacity-80">
          Groups ranked by total HP+ABS. Distribute up to {MAX_INVENTORY} powerups + 1 milk per group.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {ranked.map((g, idx) => {
            const draft = drafts[g.id];
            return (
              <div key={g.id} className="mc-panel p-3 bg-black/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-display text-mc-gold">#{idx + 1} {g.name}</div>
                  <div className="font-pixel text-lg">HP {g.hp} · ABS {g.absorption}</div>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {POWERUPS.map((it) => {
                    const active = draft.items.includes(it);
                    return (
                      <button
                        key={it}
                        onClick={() => toggleItem(g.id, it)}
                        className={`p-2 pixel-border font-pixel text-sm flex flex-col items-center gap-1 ${
                          active ? "bg-mc-grass text-black" : "bg-black/60"
                        }`}
                        title={ITEM_LABELS[it]}
                      >
                        <span className="text-xl">{ITEM_EMOJI[it]}</span>
                        <span className="text-[10px] uppercase truncate w-full text-center">{it}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 font-pixel text-base">
                  <input
                    type="checkbox"
                    checked={draft.milk}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [g.id]: { ...d[g.id], milk: e.target.checked } }))
                    }
                  />
                  🥛 Milk slot
                </label>
                <div className="font-pixel text-sm opacity-70 mt-1">
                  {draft.items.length}/{MAX_INVENTORY} powerups selected
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="mc-btn" onClick={onClose}>Cancel</button>
          <button className="mc-btn mc-btn-primary" onClick={apply}>Apply Distribution</button>
        </div>
      </div>
    </div>
  );
}
