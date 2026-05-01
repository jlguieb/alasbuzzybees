import { useGame } from "@/game/store";
import { DamageConfig } from "@/game/types";

export function SettingsPanel() {
  const damage = useGame((s) => s.damage);
  const setDamage = useGame((s) => s.setDamage);
  const groups = useGame((s) => s.groups);
  const renameGroup = useGame((s) => s.renameGroup);
  const setupGroups = useGame((s) => s.setupGroups);
  const resetGame = useGame((s) => s.resetGame);

  const setN = (n: number) => {
    if (n < 2) n = 2;
    if (n > 12) n = 12;
    setupGroups(n, groups.map((g) => g.name));
  };

  const damageField = (key: keyof DamageConfig, label: string) => (
    <label className="block">
      <div className="font-pixel text-sm opacity-80 mb-1">{label}</div>
      <input
        type="number"
        step="0.5"
        min={0}
        className="mc-input w-full"
        value={damage[key]}
        onChange={(e) => setDamage({ [key]: parseFloat(e.target.value) || 0 } as Partial<DamageConfig>)}
      />
    </label>
  );

  return (
    <div className="mc-panel mc-panel-dirt p-4 space-y-4">
      <h3 className="font-display text-sm text-mc-gold">⚙ Settings</h3>

      <div>
        <div className="font-pixel text-base mb-1 opacity-80">Number of Groups</div>
        <input
          type="number"
          min={2}
          max={12}
          className="mc-input w-32"
          value={groups.length}
          onChange={(e) => setN(parseInt(e.target.value) || 2)}
        />
      </div>

      <div>
        <div className="font-pixel text-base mb-2 opacity-80">Stage Damage</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {damageField("silverfish", "Silverfish")}
          {damageField("zombie", "Zombie")}
          {damageField("wither", "Wither")}
          {damageField("warden", "Warden")}
        </div>
      </div>

      <div>
        <div className="font-pixel text-base mb-2 opacity-80">Group Names (max 2 words)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {groups.map((g) => (
            <input
              key={g.id}
              className="mc-input"
              value={g.name}
              onChange={(e) => renameGroup(g.id, e.target.value)}
              maxLength={24}
            />
          ))}
        </div>
      </div>

      <button className="mc-btn mc-btn-danger" onClick={resetGame}>Reset Game</button>
    </div>
  );
}
