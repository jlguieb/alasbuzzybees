import { Heart } from "lucide-react";
import { MAX_HP } from "@/game/types";

interface Props {
  hp: number;
  absorption: number;
  size?: number;
  compact?: boolean;
}

/**
 * Pixel-art Minecraft hearts:
 *  - red hearts up to MAX_HP for HP
 *  - gold hearts for absorption (uncapped, wrap rows)
 *  - half-heart support for fractional HP (e.g. 1.5 dmg)
 */
export function HeartBar({ hp, absorption, size = 22, compact = false }: Props) {
  const fullHearts = Math.floor(hp);
  const half = hp - fullHearts >= 0.5 ? 1 : 0;
  const empty = MAX_HP - fullHearts - half;

  const items: { type: "full" | "half" | "empty" }[] = [
    ...Array(fullHearts).fill({ type: "full" }),
    ...Array(half).fill({ type: "half" }),
    ...Array(empty).fill({ type: "empty" }),
  ];

  return (
    <div className={`flex flex-col gap-1 ${compact ? "" : ""}`}>
      <div className="flex flex-wrap gap-0.5">
        {items.map((it, i) => (
          <HeartIcon key={`hp-${i}`} variant={it.type} color="red" size={size} />
        ))}
      </div>
      {absorption > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {Array.from({ length: absorption }).map((_, i) => (
            <HeartIcon key={`abs-${i}`} variant="full" color="gold" size={size} />
          ))}
        </div>
      )}
    </div>
  );
}

function HeartIcon({
  variant,
  color,
  size,
}: {
  variant: "full" | "half" | "empty";
  color: "red" | "gold";
  size: number;
}) {
  if (variant === "empty") {
    return (
      <Heart
        size={size}
        strokeWidth={2.5}
        className="text-foreground/25"
        style={{ imageRendering: "pixelated" }}
      />
    );
  }
  const fill = color === "red" ? "hsl(var(--mc-heart))" : "hsl(var(--mc-gold))";
  if (variant === "half") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <Heart
          size={size}
          strokeWidth={2.5}
          className="absolute inset-0 text-foreground/25"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ width: size / 2 }}>
          <Heart size={size} strokeWidth={2.5} fill={fill} stroke={fill} />
        </div>
      </div>
    );
  }
  return <Heart size={size} strokeWidth={2.5} fill={fill} stroke={fill} />;
}
