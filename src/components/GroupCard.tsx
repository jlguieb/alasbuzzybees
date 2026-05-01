import { Group, ITEM_EMOJI, ITEM_LABELS, MAX_INVENTORY } from "@/game/types";
import { HeartBar } from "./HeartBar";

interface Props {
  group: Group;
  rank?: number;
  showInventory?: boolean;
  compact?: boolean;
}

const effectColors: Record<string, string> = {
  weakness: "bg-mc-redstone/80 text-white",
  swiftness: "bg-mc-diamond/80 text-black",
  invisibility: "bg-foreground/30 text-white",
};

export function GroupCard({ group, rank, showInventory = true, compact = false }: Props) {
  const dead = group.hp <= 0 || group.eliminated;
  return (
    <div
      className={`mc-panel mc-panel-stone p-4 ${dead ? "opacity-40 grayscale" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {rank !== undefined && (
            <span className="font-display text-xs bg-mc-gold text-black px-2 py-1 pixel-border">
              #{rank}
            </span>
          )}
          <h3 className="font-display text-sm md:text-base text-mc-gold truncate drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
            {group.name}
          </h3>
        </div>
        <div className="text-right font-pixel leading-none">
          <div className="text-2xl text-mc-heart">{group.hp}/10</div>
          {group.absorption > 0 && (
            <div className="text-lg text-mc-gold">+{group.absorption} ABS</div>
          )}
        </div>
      </div>

      <div className="bg-black/50 p-2 pixel-border mb-3">
        <HeartBar hp={group.hp} absorption={group.absorption} size={compact ? 18 : 22} />
      </div>

      {group.effects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {group.effects.map((e) => (
            <span
              key={e}
              className={`font-display text-[10px] uppercase px-2 py-1 pixel-border ${effectColors[e]}`}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {showInventory && (
        <div>
          <div className="font-pixel text-sm text-foreground/70 mb-1">Inventory</div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: MAX_INVENTORY }).map((_, i) => {
              const item = group.inventory[i];
              return (
                <div
                  key={i}
                  className="aspect-square bg-black/60 pixel-border flex items-center justify-center text-2xl"
                  title={item ? ITEM_LABELS[item] : "Empty"}
                >
                  {item ? ITEM_EMOJI[item] : ""}
                </div>
              );
            })}
            <div
              className={`aspect-square pixel-border flex items-center justify-center text-2xl ${
                group.hasMilk ? "bg-white/90" : "bg-black/60"
              }`}
              title="Milk slot"
            >
              {group.hasMilk ? "🥛" : ""}
            </div>
          </div>
        </div>
      )}

      {dead && (
        <div className="mt-3 font-display text-center text-mc-redstone text-xs">
          ☠ ELIMINATED
        </div>
      )}
    </div>
  );
}
