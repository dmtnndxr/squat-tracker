import type { ExerciseType } from "../types/exercise";

type ExerciseSelectorProps = {
  selectedExercise: ExerciseType;
  onSelectExercise: (exercise: ExerciseType) => void;
};

export function ExerciseSelector({ selectedExercise, onSelectExercise }: ExerciseSelectorProps) {
  return (
    <div className="segmented-control" aria-label="Exercise mode">
      <button
        className={selectedExercise === "pushup" ? "is-selected" : ""}
        type="button"
        onClick={() => onSelectExercise("pushup")}
      >
        Push-ups
      </button>
      <button
        className={selectedExercise === "squat" ? "is-selected" : ""}
        type="button"
        onClick={() => onSelectExercise("squat")}
      >
        Squats
      </button>
    </div>
  );
}
