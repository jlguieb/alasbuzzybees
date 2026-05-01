import { useState } from "react";
import { useGame } from "@/game/store";
import { stageForRound } from "@/game/types";
import { MessageSquare, Edit3, Check, X } from "lucide-react";

export function QuestionPanel() {
  const round = useGame((s) => s.round);
  const stages = useGame((s) => s.stages);
  const questions = useGame((s) => s.questions);
  const setQuestion = useGame((s) => s.setQuestion);
  
  const stage = stageForRound(round, stages);
  const currentQuestion = questions[round] || "";
  
  const [isEditing, setIsEditing] = useState(!currentQuestion);
  const [editValue, setEditValue] = useState(currentQuestion);

  const colorVar = `var(--${stage.color})`;

  const handleSave = () => {
    setQuestion(round, editValue);
    setIsEditing(false);
  };

  const handleClear = () => {
    setQuestion(round, "");
    setEditValue("");
    setIsEditing(true);
  };

  const handleEdit = () => {
    setEditValue(currentQuestion);
    setIsEditing(true);
  };

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ background: `radial-gradient(circle at 100% 50%, hsl(${colorVar}), transparent 60%)` }}
      />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `hsl(${colorVar} / 0.2)`, border: `1px solid hsl(${colorVar} / 0.4)` }}
            >
              {stage.emoji}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Question</div>
              <div className="text-sm font-medium" style={{ color: `hsl(${colorVar})` }}>
                {stage.label} Stage · Round {round}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${colorVar} / 0.15), hsl(${colorVar} / 0.05))`, border: `2px solid hsl(${colorVar} / 0.4)` }}>
          <div className="flex items-start gap-4">
            <MessageSquare className="h-6 w-6 shrink-0 mt-1" style={{ color: `hsl(${colorVar})` }} />
            <p className="text-xl md:text-2xl font-display leading-relaxed whitespace-pre-line">{currentQuestion || <span className="text-muted-foreground">No question set for this round.</span>}</p>
          </div>
        </div>
      </div>
    </div>
  );
}