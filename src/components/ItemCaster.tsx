import { useState } from "react";
import { useGame } from "@/game/store";
import { ItemType, ITEM_LABELS, ITEM_EMOJI } from "@/game/types";

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
    ? item === "milk"
      ? user.hasMilk
      : user.inventory.includes(item)
    : false;

  return (
    <div className="mc-panel mc-panel-dirt p-4 space-y-3">
      <h3 className="font-display text-sm text-mc-gold">⚗ Cast Item</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="block">
          <div className="font-pixel text-sm opacity-80 mb-1">User</div>
          <select className="mc-input w-full" value={userId} onChange={(e) => setUserId(e.target.value)}>
            {alive.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="font-pixel text-sm opacity-80 mb-1">Item</div>
          <select className="mc-input w-full" value={item} onChange={(e) => setItem(e.target.value as ItemType)}>
            {ALL_ITEMS.map((it) => (
              <option key={it} value={it}>
                {ITEM_EMOJI[it]} {ITEM_LABELS[it]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="font-pixel text-sm opacity-80 mb-1">Target</div>
          <select className="mc-input w-full" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {alive.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="font-pixel text-sm opacity-80">
          {ownsItem ? "✅ User owns this item" : "⚠ User does not own this item"}
        </div>
        <button
          className="mc-btn mc-btn-diamond"
          disabled={!userId || !targetId || !ownsItem}
          onClick={() => cast(userId, item, targetId)}
        >
          Cast
        </button>
      </div>
    </div>
  );
}
