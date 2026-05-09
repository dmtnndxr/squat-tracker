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
        {t.pushups}
      </button>
      <button
        className={selectedExercise === "squat" ? "is-selected" : ""}
        type="button"
        onClick={() => onSelectExercise("squat")}
      >
        {t.squats}
      </button>
    </div>
  );
}
