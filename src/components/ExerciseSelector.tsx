import { Dumbbell, PersonStanding } from "lucide-react";
import type { ExerciseType } from "../types/exercise";
import type { Messages } from "../i18n/translations";

type ExerciseSelectorProps = {
  selectedExercise: ExerciseType;
  t: Messages;
  onSelectExercise: (exercise: ExerciseType) => void;
};

export function ExerciseSelector({ selectedExercise, t, onSelectExercise }: ExerciseSelectorProps) {
  return (
    <div className="segmented-control" aria-label={t.exerciseMode}>
      <button
        className={selectedExercise === "pushup" ? "is-selected" : ""}
        type="button"
        onClick={() => onSelectExercise("pushup")}
      >
        <Dumbbell size={20} aria-hidden="true" />
        {t.pushups}
      </button>
      <button
        className={selectedExercise === "squat" ? "is-selected" : ""}
        type="button"
        onClick={() => onSelectExercise("squat")}
      >
        <PersonStanding size={20} aria-hidden="true" />
        {t.squats}
      </button>
    </div>
  );
}
