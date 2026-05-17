import type { PoseState } from "../types/exercise";

export const POSE_STABILITY_MS = 180;

export type PoseStabilityState = {
  candidatePoseState: PoseState;
  candidateSince: number;
  stablePoseState: PoseState;
};

export const INITIAL_POSE_STABILITY_STATE: PoseStabilityState = {
  candidatePoseState: "unknown",
  candidateSince: 0,
  stablePoseState: "unknown",
};

export function updateStablePoseState(
  state: PoseStabilityState,
  rawPoseState: PoseState,
  now: number,
  minStableMs = POSE_STABILITY_MS,
): PoseStabilityState {
  if (rawPoseState === "unknown") {
    return {
      candidatePoseState: "unknown",
      candidateSince: now,
      stablePoseState: "unknown",
    };
  }

  if (rawPoseState === "middle") {
    return {
      ...state,
      candidatePoseState: "middle",
      candidateSince: now,
      stablePoseState: "middle",
    };
  }

  if (rawPoseState !== state.candidatePoseState) {
    return {
      ...state,
      candidatePoseState: rawPoseState,
      candidateSince: now,
    };
  }

  if (now - state.candidateSince < minStableMs) {
    return state;
  }

  return {
    ...state,
    stablePoseState: rawPoseState,
  };
}
