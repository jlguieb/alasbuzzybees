import { Heart } from "lucide-react";
import { MAX_HP } from "@/game/types";

interface Props {
  hp: number;
  absorption: number;
  size?: number;
}

export function HeartBar({ hp, absorption, size = 20 }: Props) {
  const fullHearts = Math.floor(hp);
  const half = hp - fullHearts >= 0.5 ? 1 : 0;
  const empty = MAX_HP - fullHearts - half;

  return (
    <div className="flex flex-col gap-1.5 pixel-crisp">
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: fullHearts }).map((_, i) => (
          <HeartIcon key={`f-${i}`} variant="full" color="red" size={size} />
        ))}
        {Array.from({ length: half }).map((_, i) => (
          <HeartIcon key={`h-${i}`} variant="half" color="red" size={size} />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <HeartIcon key={`e-${i}`} variant="empty" color="red" size={size} />
        ))}
      </div>
      {absorption > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {Array.from({ length: absorption }).map((_, i) => (
            <HeartIcon key={`a-${i}`} variant="full" color="gold" size={size} />
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
  const fill = color === "red" ? "hsl(var(--hp-heart))" : "hsl(var(--abs-heart))";
  const glow = color === "red" ? "hsl(0 85% 60% / 0.5)" : "hsl(45 100% 62% / 0.6)";

  if (variant === "empty") {
    return (
      <Heart
        size={size}
        strokeWidth={2.5}
        className="text-foreground/15"
        fill="hsl(var(--hp-empty))"
      />
    );
  }
  if (variant === "half") {
    return (
      <div className="relative" style={{ width: size, height: size, filter: `drop-shadow(0 0 4px ${glow})` }}>
        <Heart size={size} strokeWidth={2.5} className="absolute inset-0 text-foreground/15" fill="hsl(var(--hp-empty))" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: size / 2 }}>
          <Heart size={size} strokeWidth={2.5} fill={fill} stroke={fill} />
        </div>
      </div>
    );
  }
  return (
    <span style={{ filter: `drop-shadow(0 0 4px ${glow})`, lineHeight: 0 }}>
      <Heart size={size} strokeWidth={2.5} fill={fill} stroke={fill} />
    </span>
  );
}
