import { useEffect, useState } from "react";
import { stageForRound, stageLabel, timerForRound, TOTAL_ROUNDS } from "@/game/types";

interface Props {
  round: number;
}

export function RoundTimer({ round }: Props) {
  const stage = stageForRound(round);
  const total = timerForRound(round);
  const [seconds, setSeconds] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSeconds(total);
    setRunning(false);
  }, [round, total]);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, seconds]);

  const pct = (seconds / total) * 100;

  return (
    <div className={`mc-panel p-3 stage-${stage}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <div className="font-display text-[10px] uppercase opacity-80">Round</div>
          <div className="font-display text-2xl">{round} / {TOTAL_ROUNDS}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-[10px] uppercase opacity-80">Stage</div>
          <div className="font-display text-lg">{stageLabel(stage)}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-[10px] uppercase opacity-80">Time</div>
          <div className="font-display text-3xl tabular-nums">{seconds}s</div>
        </div>
      </div>
      <div className="h-3 bg-black/50 pixel-border overflow-hidden">
        <div
          className="h-full bg-mc-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button className="mc-btn mc-btn-primary flex-1" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="mc-btn flex-1" onClick={() => { setSeconds(total); setRunning(false); }}>
          Reset
        </button>
      </div>
    </div>
  );
}
