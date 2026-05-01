import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { GroupCard } from "@/components/GroupCard";
import { RoundTimer } from "@/components/RoundTimer";
import { ItemCaster } from "@/components/ItemCaster";
import { SettingsPanel } from "@/components/SettingsPanel";
import { CardRedistribution } from "@/components/CardRedistribution";
import { stageForRound, stageLabel } from "@/game/types";

type View = "scoreboard" | "control";

const Index = () => {
  const [view, setView] = useState<View>("control");
  const [showRedist, setShowRedist] = useState(false);
  const [showDeepDark, setShowDeepDark] = useState(false);

  const groups = useGame((s) => s.groups);
  const round = useGame((s) => s.round);
  const log = useGame((s) => s.log);
  const tiebreaker = useGame((s) => s.tiebreaker);
  const winnerId = useGame((s) => s.winnerId);
  const applyCorrect = useGame((s) => s.applyCorrect);
  const applyWrong = useGame((s) => s.applyWrong);
  const nextRound = useGame((s) => s.nextRound);
  const prevRound = useGame((s) => s.prevRound);
  const startTiebreaker = useGame((s) => s.startTiebreaker);
  const declareWinner = useGame((s) => s.declareWinner);

  // Round 31 alert
  useEffect(() => {
    if (round === 31 && !tiebreaker && !winnerId) setShowDeepDark(true);
  }, [round, tiebreaker, winnerId]);

  // Auto-prompt redistribution every 3 rounds (rounds 4,7,10,...)
  const stage = stageForRound(round);

  const ranked = useMemo(
    () => [...groups].sort((a, b) => b.hp + b.absorption - (a.hp + a.absorption)),
    [groups]
  );

  const winner = winnerId ? groups.find((g) => g.id === winnerId) : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mc-panel mc-panel-dirt sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-float">🐝</span>
            <div>
              <h1 className="font-display text-mc-gold text-sm md:text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                BUZZY BEES
              </h1>
              <div className="font-pixel text-sm opacity-80">
                Quiz Bee · {stageLabel(stage)} Stage
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`mc-btn ${view === "scoreboard" ? "mc-btn-primary" : ""}`}
              onClick={() => setView("scoreboard")}
            >
              📺 Scoreboard
            </button>
            <button
              className={`mc-btn ${view === "control" ? "mc-btn-primary" : ""}`}
              onClick={() => setView("control")}
            >
              🎮 GM Panel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Tiebreaker banner */}
        {tiebreaker && !winner && (
          <div className="mc-panel p-4 bg-mc-warden text-foreground animate-shake">
            <div className="font-display text-mc-gold text-base mb-2">⚔ WARDEN'S SONIC BOOM — TIEBREAKER</div>
            <div className="font-pixel text-base">All items locked. Declare a winner to end the game.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {groups.filter((g) => !g.eliminated).map((g) => (
                <button key={g.id} className="mc-btn mc-btn-gold" onClick={() => declareWinner(g.id)}>
                  🏆 {g.name} Wins
                </button>
              ))}
            </div>
          </div>
        )}

        {winner && (
          <div className="mc-panel p-6 bg-mc-gold text-black text-center">
            <div className="font-display text-2xl">🏆 CHAMPION 🏆</div>
            <div className="font-display text-3xl mt-2">{winner.name}</div>
          </div>
        )}

        <RoundTimer round={round} />

        {/* Round 31 modal */}
        {showDeepDark && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="mc-panel mc-panel-stone p-6 max-w-lg text-center">
              <div className="text-5xl mb-2">🌑</div>
              <h2 className="font-display text-mc-gold text-base mb-2">THE DEEP DARK</h2>
              <p className="font-pixel text-lg mb-4">
                Round 31 has begun. All items can be used simultaneously this round.
              </p>
              <button className="mc-btn mc-btn-primary" onClick={() => setShowDeepDark(false)}>
                Enter the Deep Dark
              </button>
            </div>
          </div>
        )}

        {/* Group cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {ranked.map((g, i) => (
            <div key={g.id} className="space-y-2">
              <GroupCard group={g} rank={i + 1} showInventory={view === "control"} />
              {view === "control" && !winner && !tiebreaker && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="mc-btn mc-btn-primary"
                    disabled={g.eliminated}
                    onClick={() => applyCorrect(g.id)}
                  >
                    ✓ Correct
                  </button>
                  <button
                    className="mc-btn mc-btn-danger"
                    disabled={g.eliminated}
                    onClick={() => applyWrong(g.id)}
                  >
                    ✗ Wrong
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {view === "control" && !winner && (
          <>
            {/* Round controls */}
            <div className="mc-panel mc-panel-stone p-4 flex flex-wrap items-center gap-2">
              <button className="mc-btn" onClick={prevRound} disabled={round <= 1}>◀ Prev Round</button>
              <button className="mc-btn mc-btn-primary" onClick={nextRound} disabled={round >= 31}>Next Round ▶</button>
              <button className="mc-btn mc-btn-gold" onClick={() => setShowRedist(true)}>🃏 Redistribute Cards</button>
              {!tiebreaker && (
                <button className="mc-btn mc-btn-danger ml-auto" onClick={startTiebreaker}>
                  ⚔ Start Tiebreaker
                </button>
              )}
            </div>

            <ItemCaster />
            <SettingsPanel />

            {/* Log */}
            <div className="mc-panel p-4 bg-black/60">
              <h3 className="font-display text-sm text-mc-gold mb-2">📜 Game Log</h3>
              <ul className="font-pixel text-base space-y-1 max-h-64 overflow-auto">
                {log.map((l, i) => (
                  <li key={i} className="opacity-90 border-b border-foreground/10 pb-1">{l}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {view === "scoreboard" && (
          <div className="mc-panel p-3 bg-black/60 text-center font-pixel text-base opacity-80">
            Public scoreboard view · Cast this to your projector
          </div>
        )}

        {showRedist && <CardRedistribution onClose={() => setShowRedist(false)} />}
      </main>

      <footer className="text-center font-pixel text-sm opacity-60 py-6">
        Crafted with 🐝 for Buzzy Bees Quiz Competition
      </footer>
    </div>
  );
};

export default Index;
