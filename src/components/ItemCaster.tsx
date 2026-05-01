import { useState } from "react";
import { useGame } from "@/game/store";
import { ItemType, ITEM_LABELS, ITEM_EMOJI } from "@/game/types";
import { Wand2 } from "lucide-react";

const ALL_ITEMS: ItemType[] = [
  "healing", "harming", "weakness", "swiftness", "invisibility", "goldenApple", "totem", "milk",
];

export function ItemCaster() {
  const groups = useGame((s) => s.groups);
  const cast = useGame((s) => s.castItem);

  const alive = groups.filter((g) => !g.eliminated);
  const [userId, setUserId] = useState(alive[0]?.id ?? "");
  const [item, setItem] = useState<ItemType>("healing");
  const [targetId, setTargetId] = useState(alive[0]?.id ?? "");

  const user = groups.find((g) => g.id === userId);
  const ownsItem = user
    ? item === "milk" ? user.hasMilk : user.inventory.includes(item)
    : false;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="h-4 w-4 text-bee-honey" />
        <h3 className="font-display text-sm">Cast Item</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">User</label>
          <select className="input" value={userId} onChange={(e) => setUserId(e.target.value)}>
            {alive.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Item</label>
          <select className="input" value={item} onChange={(e) => setItem(e.target.value as ItemType)}>
            {ALL_ITEMS.map((it) => (
              <option key={it} value={it}>{ITEM_EMOJI[it]}  {ITEM_LABELS[it]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Target</label>
          <select className="input" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {alive.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs ${ownsItem ? "text-primary" : "text-muted-foreground"}`}>
          {ownsItem ? "✓ User has this item" : "⚠ User does not own this item"}
        </div>
        <button
          className="btn btn-honey"
          disabled={!userId || !targetId || !ownsItem}
          onClick={() => cast(userId, item, targetId)}
        >
          <Wand2 className="h-4 w-4" /> Cast
        </button>
      </div>
    </div>
  );
}
