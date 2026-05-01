import { Group, ITEM_EMOJI, ITEM_LABELS, MAX_INVENTORY } from "@/game/types";
import { HeartBar } from "./HeartBar";
import { Skull, Sparkles, Zap, Eye } from "lucide-react";

interface Props {
  group: Group;
  rank?: number;
  showInventory?: boolean;
  highlight?: boolean;
}

const effectMeta: Record<string, { label: string; icon: JSX.Element; bg: string }> = {
  weakness: { label: "Weakness", icon: <Skull className="h-3 w-3" />, bg: "bg-destructive/20 text-destructive border-destructive/40" },
  swiftness: { label: "Swiftness", icon: <Zap className="h-3 w-3" />, bg: "bg-stage-warden/20 text-stage-warden border-stage-warden/40" },
  invisibility: { label: "Invisible", icon: <Eye className="h-3 w-3" />, bg: "bg-muted text-muted-foreground border-border" },
};

export function GroupCard({ group, rank, showInventory = true, highlight }: Props) {
  const dead = group.hp <= 0 || group.eliminated;

  return (
    <div
      className={`glass rounded-2xl p-5 transition-all ${
        dead ? "opacity-40 grayscale" : highlight ? "ring-honey" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {rank !== undefined && (
            <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-display text-xs ${
              rank === 1 ? "bg-gradient-to-br from-bee-honey to-bee-amber text-black" :
              rank === 2 ? "bg-secondary text-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {rank}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-sm md:text-base text-foreground truncate">
              {group.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {dead ? (
                <span className="flex items-center gap-1 text-destructive">
                  <Skull className="h-3 w-3" /> Eliminated
                </span>
              ) : (
                <>
                  <span>HP {group.hp}/10</span>
                  {group.absorption > 0 && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="text-bee-honey flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> +{group.absorption} ABS
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="font-pixel text-3xl tabular-nums leading-none">
          <span className="text-hp">{group.hp}</span>
          <span className="text-muted-foreground/60 text-xl">/10</span>
        </div>
      </div>

      <div className="bg-background/40 rounded-xl p-3 mb-3 border border-border/40">
        <HeartBar hp={group.hp} absorption={group.absorption} size={18} />
      </div>

      {group.effects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {group.effects.map((e) => {
            const m = effectMeta[e];
            return (
              <span key={e} className={`stage-chip border ${m.bg}`}>
                {m.icon} {m.label}
              </span>
            );
          })}
        </div>
      )}

      {showInventory && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
            Inventory
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: MAX_INVENTORY }).map((_, i) => {
              const item = group.inventory[i];
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl border transition-colors ${
                    item ? "bg-secondary/80 border-border" : "bg-background/30 border-border/30"
                  }`}
                  title={item ? ITEM_LABELS[item] : "Empty slot"}
                >
                  {item ? ITEM_EMOJI[item] : <span className="text-muted-foreground/30 text-sm">—</span>}
                </div>
              );
            })}
            <div
              className={`aspect-square rounded-lg flex items-center justify-center text-2xl border ${
                group.hasMilk ? "bg-foreground/95 border-foreground/60" : "bg-background/30 border-border/30"
              }`}
              title="Milk slot"
            >
              {group.hasMilk ? "🥛" : <span className="text-muted-foreground/30 text-sm">🥛</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
