import { Dumbbell, PersonStanding } from "lucide-react";
import type { ReactNode } from "react";
import type { Messages } from "../i18n/translations";
import type { ExerciseType } from "../types/exercise";

type ExerciseSelectorProps = {
  selectedExercise: ExerciseType;
  t: Messages;
  onSelectExercise: (exercise: ExerciseType) => void;
};

export function ExerciseSelector({ selectedExercise, t, onSelectExercise }: ExerciseSelectorProps) {
  return (
    <div
      className="grid w-full max-w-sm grid-cols-2 rounded-full border border-[#444933]/80 bg-[#131314]/75 p-1 shadow-2xl backdrop-blur"
      aria-label={t.exerciseMode}
    >
      <ExerciseButton
        isSelected={selectedExercise === "pushup"}
        label={t.pushups}
        icon={<Dumbbell size={18} aria-hidden="true" />}
        onClick={() => onSelectExercise("pushup")}
      />
      <ExerciseButton
        isSelected={selectedExercise === "squat"}
        label={t.squats}
        icon={<PersonStanding size={18} aria-hidden="true" />}
        onClick={() => onSelectExercise("squat")}
      />
    </div>
  );
}

function ExerciseButton({
  isSelected,
  label,
  icon,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-black uppercase tracking-[0.08em] transition ${
        isSelected ? "bg-[#c3f400] text-[#161e00]" : "text-[#c4c9ac] hover:bg-white/10 hover:text-white"
      }`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {icon}
      {label}
    </button>
  );
}
