import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { GroupCard } from "@/components/GroupCard";
import { RoundTimer } from "@/components/RoundTimer";
import { QuestionPanel } from "@/components/QuestionPanel";
import { ItemCaster } from "@/components/ItemCaster";
import { SettingsPanel } from "@/components/SettingsPanel";
import { CardRedistribution } from "@/components/CardRedistribution";
import { stageForRound } from "@/game/types";
import {
  Check, X, ChevronLeft, ChevronRight, Layers, Swords,
  Tv2, Gamepad2, Trophy, ScrollText,
} from "lucide-react";

type View = "scoreboard" | "control";
type Tab = "play" | "items" | "settings";

const Index = () => {
  const [view, setView] = useState<View>("control");
  const [tab, setTab] = useState<Tab>("play");
  const [showRedist, setShowRedist] = useState(false);
  const [showDeepDark, setShowDeepDark] = useState(false);

  const groups = useGame((s) => s.groups);
  const round = useGame((s) => s.round);
  const stages = useGame((s) => s.stages);
  const totalRounds = useGame((s) => s.totalRounds);
  const log = useGame((s) => s.log);
  const tiebreaker = useGame((s) => s.tiebreaker);
  const winnerId = useGame((s) => s.winnerId);
  const applyCorrect = useGame((s) => s.applyCorrect);
  const applyWrong = useGame((s) => s.applyWrong);
  const nextRound = useGame((s) => s.nextRound);
  const prevRound = useGame((s) => s.prevRound);
  const startTiebreaker = useGame((s) => s.startTiebreaker);
  const declareWinner = useGame((s) => s.declareWinner);

  const stage = stageForRound(round, stages);

  useEffect(() => {
    if (round === totalRounds && stage.id === "warden" && !tiebreaker && !winnerId) {
      setShowDeepDark(true);
    }
  }, [round, totalRounds, stage.id, tiebreaker, winnerId]);

  const ranked = useMemo(
    () => [...groups].sort((a, b) => b.hp + b.absorption - (a.hp + a.absorption)),
    [groups]
  );
  const winner = winnerId ? groups.find((g) => g.id === winnerId) : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-bee-honey to-bee-amber flex items-center justify-center text-2xl shadow-[0_0_24px_hsl(45_100%_60%/0.4)]">
              🐝
            </div>
            <div>
              <h1 className="font-display text-sm md:text-base text-foreground">
                BUZZY <span className="text-bee-honey">BEES</span>
              </h1>
              <div className="text-xs text-muted-foreground">
                Quiz Bee · {stage.label} Stage
              </div>
            </div>
          </div>
          <div className="flex gap-2 p-1 rounded-2xl bg-secondary/40 border border-border/60">
            <button
              className={`btn btn-icon px-3 ${view === "scoreboard" ? "btn-honey" : "btn-ghost"}`}
              onClick={() => setView("scoreboard")}
            >
              <Tv2 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Scoreboard</span>
            </button>
            <button
              className={`btn btn-icon px-3 ${view === "control" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setView("control")}
            >
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">GM Panel</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Tiebreaker */}
        {tiebreaker && !winner && (
          <div className="glass rounded-2xl p-5 border-stage-warden/50 animate-shake"
               style={{ background: "linear-gradient(135deg, hsl(var(--stage-warden) / 0.15), transparent)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Swords className="h-4 w-4 text-stage-warden" />
              <h3 className="font-display text-sm text-stage-warden">WARDEN'S SONIC BOOM — TIEBREAKER</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              All items locked. Declare a winner to end the game.
            </p>
            <div className="flex flex-wrap gap-2">
              {groups.filter((g) => !g.eliminated).map((g) => (
                <button key={g.id} className="btn btn-honey" onClick={() => declareWinner(g.id)}>
                  <Trophy className="h-4 w-4" /> {g.name} Wins
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Winner */}
        {winner && (
          <div className="glass-strong ring-honey rounded-2xl p-8 text-center">
            <div className="text-5xl mb-2 animate-float">🏆</div>
            <div className="text-xs uppercase tracking-[0.3em] text-bee-honey mb-1">Champion</div>
            <div className="font-display text-2xl md:text-3xl">{winner.name}</div>
          </div>
        )}

        <RoundTimer />

        <QuestionPanel />

        {/* Round 31 modal */}
        {showDeepDark && (
          <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-strong rounded-2xl p-8 max-w-md text-center">
              <div className="text-6xl mb-3 animate-float">🌑</div>
              <div className="text-xs uppercase tracking-[0.3em] text-stage-warden mb-2">Final Round</div>
              <h2 className="font-display text-base mb-3">THE DEEP DARK</h2>
              <p className="text-sm text-muted-foreground mb-5">
                The final round has begun. All items can be used simultaneously this round.
              </p>
              <button className="btn btn-warden w-full" onClick={() => setShowDeepDark(false)}>
                Enter the Deep Dark
              </button>
            </div>
          </div>
        )}

        {/* Group cards */}
        <div className={`grid gap-3 ${
          view === "scoreboard" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 scanlines" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        }`}>
          {ranked.map((g, i) => (
            <div key={g.id} className="space-y-2">
              <GroupCard
                group={g}
                rank={i + 1}
                showInventory={view === "control"}
                highlight={i === 0 && !winner}
              />
              {view === "control" && !winner && !tiebreaker && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="btn btn-primary"
                    disabled={g.eliminated}
                    onClick={() => applyCorrect(g.id)}
                  >
                    <Check className="h-4 w-4" /> Correct
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={g.eliminated}
                    onClick={() => applyWrong(g.id)}
                  >
                    <X className="h-4 w-4" /> Wrong
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* GM Panel content */}
        {view === "control" && !winner && (
          <>
            {/* Round controls */}
            <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-2">
              <button className="btn" onClick={prevRound} disabled={round <= 1}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button className="btn btn-primary" onClick={nextRound} disabled={round >= totalRounds}>
                Next Round <ChevronRight className="h-4 w-4" />
              </button>
              <button className="btn btn-honey" onClick={() => setShowRedist(true)}>
                <Layers className="h-4 w-4" /> Redistribute Cards
              </button>
              {!tiebreaker && (
                <button className="btn btn-warden ml-auto" onClick={startTiebreaker}>
                  <Swords className="h-4 w-4" /> Start Tiebreaker
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-secondary/40 border border-border/60 w-fit">
              {([
                ["play", "Play", Gamepad2],
                ["items", "Items", Layers],
                ["settings", "Settings", ScrollText],
              ] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  className={`btn btn-icon px-4 ${tab === id ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setTab(id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>

            {tab === "play" && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ScrollText className="h-4 w-4 text-bee-honey" />
                  <h3 className="font-display text-sm">Game Log</h3>
                </div>
                <ul className="space-y-1.5 max-h-72 overflow-auto pr-2 text-sm">
                  {log.map((l, i) => (
                    <li key={i} className="text-muted-foreground border-b border-border/30 pb-1.5 last:border-0">
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "items" && <ItemCaster />}
            {tab === "settings" && <SettingsPanel />}
          </>
        )}

        {view === "scoreboard" && (
          <div className="glass rounded-2xl p-4 text-center text-sm text-muted-foreground">
            📺 Public scoreboard view · Cast this to your projector
          </div>
        )}

        {showRedist && <CardRedistribution onClose={() => setShowRedist(false)} />}
      </main>

      <footer className="text-center text-xs text-muted-foreground py-8 border-t border-border/40 mt-8">
        Crafted with 🐝 for Buzzy Bees Quiz Competitions
      </footer>
    </div>
  );
};

export default Index;
