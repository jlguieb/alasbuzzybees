import { useGame } from "@/game/store";
import { StageConfig, stageForRound } from "@/game/types";
import { RotateCcw, Users, Swords, MessageSquare } from "lucide-react";

export function SettingsPanel() {
  const groups = useGame((s) => s.groups);
  const stages = useGame((s) => s.stages);
  const totalRounds = useGame((s) => s.totalRounds);
  const questions = useGame((s) => s.questions);
  const renameGroup = useGame((s) => s.renameGroup);
  const setupGroups = useGame((s) => s.setupGroups);
  const updateStage = useGame((s) => s.updateStage);
  const resetStages = useGame((s) => s.resetStages);
  const resetGame = useGame((s) => s.resetGame);
  const setQuestion = useGame((s) => s.setQuestion);

  const setN = (n: number) => {
    if (n < 2) n = 2;
    if (n > 12) n = 12;
    setupGroups(n, groups.map((g) => g.name));
  };

  const stageField = (stage: StageConfig, key: keyof StageConfig, type: "number" | "text", step = 1) => (
    <input
      type={type}
      step={step}
      min={type === "number" ? 0 : undefined}
      className="input text-center"
      value={stage[key] as number | string}
      onChange={(e) =>
        updateStage(stage.id, {
          [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
        } as Partial<StageConfig>)
      }
    />
  );

  return (
    <div className="space-y-4">
      {/* Groups */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-bee-honey" />
            <h3 className="font-display text-sm">Groups</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Count</label>
            <input
              type="number"
              min={2}
              max={12}
              className="input w-20 text-center"
              value={groups.length}
              onChange={(e) => setN(parseInt(e.target.value) || 2)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {groups.map((g, i) => (
            <div key={g.id} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-display">
                {i + 1}
              </span>
              <input
                className="input pl-8"
                value={g.name}
                onChange={(e) => renameGroup(g.id, e.target.value)}
                maxLength={24}
                placeholder="Group name (max 2 words)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stage presets */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-bee-honey" />
            <h3 className="font-display text-sm">Stage Presets</h3>
          </div>
          <button className="btn btn-ghost text-xs" onClick={resetStages}>
            <RotateCcw className="h-3 w-3" /> Reset defaults
          </button>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left pb-3 px-2">Stage</th>
                <th className="text-left pb-3 px-2">Label</th>
                <th className="text-center pb-3 px-2">Start</th>
                <th className="text-center pb-3 px-2">End</th>
                <th className="text-center pb-3 px-2">Timer (s)</th>
                <th className="text-center pb-3 px-2">Damage</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s) => (
                <tr key={s.id} className="border-t border-border/40">
                  <td className="py-2 px-2">
                    <span
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: `hsl(var(--${s.color}) / 0.15)`,
                        color: `hsl(var(--${s.color}))`,
                        border: `1px solid hsl(var(--${s.color}) / 0.3)`,
                      }}
                    >
                      {s.emoji} {s.label}
                    </span>
                  </td>
                  <td className="py-2 px-2">{stageField(s, "label", "text")}</td>
                  <td className="py-2 px-2 w-24">{stageField(s, "startRound", "number")}</td>
                  <td className="py-2 px-2 w-24">{stageField(s, "endRound", "number")}</td>
                  <td className="py-2 px-2 w-24">{stageField(s, "timer", "number")}</td>
                  <td className="py-2 px-2 w-24">{stageField(s, "damage", "number", 0.5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Tip: stages should cover consecutive rounds. Total rounds is derived from the highest end value.
        </p>
      </div>

      {/* Round Questions */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-bee-honey" />
            <h3 className="font-display text-sm">Round Questions</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {Object.keys(questions).length} / {totalRounds} set
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {Array.from({ length: totalRounds }, (_, i) => i + 1).map((roundNum) => {
            const roundStage = stageForRound(roundNum, stages);
            return (
              <div
                key={roundNum}
                className="p-3 rounded-xl border border-border/40"
                style={{
                  background: `hsl(var(--${roundStage.color}) / 0.05)`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      background: `hsl(var(--${roundStage.color}) / 0.2)`,
                      color: `hsl(var(--${roundStage.color}))`,
                    }}
                  >
                    R{roundNum}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {roundStage.emoji} {roundStage.label}
                  </span>
                </div>
                <textarea
                  className="input w-full text-sm min-h-[60px] resize-none"
                  value={questions[roundNum] || ""}
                  onChange={(e) => setQuestion(roundNum, e.target.value)}
                  placeholder={`Question for round ${roundNum}...`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-danger" onClick={resetGame}>
          <RotateCcw className="h-4 w-4" /> Reset Game
        </button>
      </div>
    </div>
  );
}
