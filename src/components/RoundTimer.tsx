import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { stageForRound } from "@/game/types";
import { Pause, Play, RotateCcw } from "lucide-react";

export function RoundTimer() {
  const round = useGame((s) => s.round);
  const stages = useGame((s) => s.stages);
  const totalRounds = useGame((s) => s.totalRounds);
  const stage = stageForRound(round, stages);
  const total = stage.timer;

  const [seconds, setSeconds] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSeconds(total);
    setRunning(false);
  }, [round, total]);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { setRunning(false); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, seconds]);

  const pct = (seconds / total) * 100;
  const stageColor = `hsl(var(--${stage.color.replace("stage-", "stage-")}))`;
  const colorVar = `var(--${stage.color})`;

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 50%, hsl(${colorVar}), transparent 60%)` }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `hsl(${colorVar} / 0.2)`, border: `1px solid hsl(${colorVar} / 0.4)` }}
          >
            {stage.emoji}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Round</div>
            <div className="font-display text-2xl">
              {round}<span className="text-muted-foreground/60 text-base"> / {totalRounds}</span>
            </div>
            <div className="text-sm font-medium mt-0.5" style={{ color: `hsl(${colorVar})` }}>
              {stage.label} Stage
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Time Left</div>
            <div className="font-display text-3xl tabular-nums">{seconds}s</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-icon btn-primary" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button className="btn btn-icon" onClick={() => { setSeconds(total); setRunning(false); }}>
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 bg-background/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(${colorVar}), hsl(${colorVar} / 0.6))`,
            boxShadow: `0 0 12px hsl(${colorVar} / 0.6)`,
          }}
        />
      </div>
    </div>
  );
}
