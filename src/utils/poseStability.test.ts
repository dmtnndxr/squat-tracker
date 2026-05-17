import { describe, expect, it } from "vitest";
import {
  INITIAL_POSE_STABILITY_STATE,
  POSE_STABILITY_MS,
  updateStablePoseState,
} from "./poseStability";

describe("updateStablePoseState", () => {
  it("does not promote brief pose noise to a stable state", () => {
    const pending = updateStablePoseState(INITIAL_POSE_STABILITY_STATE, "down", 1_000);
    const stillPending = updateStablePoseState(pending, "down", 1_000 + POSE_STABILITY_MS - 1);

    expect(stillPending.stablePoseState).toBe("unknown");
  });

  it("promotes a pose after it remains stable long enough", () => {
    const pending = updateStablePoseState(INITIAL_POSE_STABILITY_STATE, "down", 1_000);
    const stable = updateStablePoseState(pending, "down", 1_000 + POSE_STABILITY_MS);

    expect(stable.stablePoseState).toBe("down");
  });

  it("resets stability when landmarks are lost", () => {
    const stable = {
      candidatePoseState: "up" as const,
      candidateSince: 1_000,
      stablePoseState: "up" as const,
    };

    expect(updateStablePoseState(stable, "unknown", 2_000).stablePoseState).toBe("unknown");
  });

  it("treats middle as a neutral state instead of keeping the previous stable pose", () => {
    const stable = {
      candidatePoseState: "up" as const,
      candidateSince: 1_000,
      stablePoseState: "up" as const,
    };

    expect(updateStablePoseState(stable, "middle", 2_000).stablePoseState).toBe("middle");
  });
});
