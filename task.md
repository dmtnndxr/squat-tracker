*<https://chatgpt.com/c/69fd0d82-8fdc-83eb-97a5-0b8a9793cd1c>

## MVP description: Browser Exercise Counter App

Build a browser-based MVP that uses the device camera to detect a person’s body pose and count completed **push-ups** and **squats**. The app should maintain a **local global counter** for each exercise on the user’s device.

The app does not need user accounts, backend, cloud storage, or multi-person support for the MVP.

---

# 1. Goal

Create a web app that can:

1. Open the user’s webcam.
2. Detect human pose in real time.
3. Recognize two exercises:

   * Push-ups
   * Squats
4. Count completed repetitions.
5. Store total local counters for each exercise:

   * Total push-ups
   * Total squats
6. Persist counters in browser storage, so they remain after page refresh.

---

# 2. Recommended Tech Stack

Frontend:

```text
React / Next.js / Vite
TypeScript
MediaPipe Pose / MediaPipe Tasks Vision
HTML5 camera API
localStorage or IndexedDB
```

For MVP, `localStorage` is enough.

Pose detection:

```text
MediaPipe Pose Landmarker
```

Optional later:

```text
TensorFlow.js or scikit-learn-trained model converted to JS
```

But for MVP, use rule-based detection with body angles.

---

# 3. Core User Flow

1. User opens the app in browser.
2. User allows camera access.
3. App shows live camera preview.
4. User selects exercise mode:

   * Push-ups
   * Squats
5. App detects pose landmarks.
6. App displays:

   * Current exercise
   * Current session count
   * Total local count for selected exercise
   * Basic status: `Up`, `Down`, `No person detected`, `Bad angle`
7. When a valid repetition is completed, app increments:

   * Session counter
   * Global local counter for that exercise
8. User can reset session counter.
9. User can reset global local counters.

---

# 4. Main Screens

## Home / Camera Screen

Required UI elements:

```text
[Camera Preview]

Exercise Mode:
[Push-ups] [Squats]

Current Status:
Detected / Not detected
Current position: Up / Down / Unknown

Session Count:
Push-ups: 12

Local Total:
Total push-ups: 148
Total squats: 92

Buttons:
[Start Camera]
[Stop Camera]
[Reset Session]
[Reset Local Totals]
```

Optional overlay:

```text
Draw skeleton landmarks over the camera feed.
```

---

# 5. Pose Landmarks Needed

Use MediaPipe landmarks:

For push-ups:

```text
left_shoulder
right_shoulder
left_elbow
right_elbow
left_wrist
right_wrist
left_hip
right_hip
```

For squats:

```text
left_hip
right_hip
left_knee
right_knee
left_ankle
right_ankle
left_shoulder
right_shoulder
```

---

# 6. Angle Calculation

Implement a helper function:

```ts
function calculateAngle(a: Point, b: Point, c: Point): number
```

Where `b` is the joint point.

Example:

```text
shoulder - elbow - wrist = elbow angle
hip - knee - ankle = knee angle
shoulder - hip - knee = hip angle
```

Use the angle to determine exercise state.

---

# 7. Push-Up Detection Logic

Recommended camera position:

```text
Side view of user
Full upper body visible
One person in frame
```

Use elbow angle:

```text
leftElbowAngle = angle(leftShoulder, leftElbow, leftWrist)
rightElbowAngle = angle(rightShoulder, rightElbow, rightWrist)
averageElbowAngle = average of confident visible side angles
```

Basic thresholds:

```text
UP position:
averageElbowAngle > 150 degrees

DOWN position:
averageElbowAngle < 95 degrees
```

Counting rule:

```text
Initial state: unknown

If state becomes DOWN after UP:
    mark rep as in progress

If state becomes UP after DOWN:
    count +1
```

Pseudo-logic:

```ts
if (exercise === "pushup") {
  if (averageElbowAngle > 150) {
    currentState = "up";
  } else if (averageElbowAngle < 95) {
    currentState = "down";
  } else {
    currentState = "middle";
  }

  if (previousState === "up" && currentState === "down") {
    repStarted = true;
  }

  if (repStarted && previousState === "down" && currentState === "up") {
    incrementPushupCount();
    repStarted = false;
  }

  previousState = currentState;
}
```

---

# 8. Squat Detection Logic

Recommended camera position:

```text
Side or 45-degree view
Full body visible
Feet, knees, hips, and shoulders visible
```

Use knee angle:

```text
leftKneeAngle = angle(leftHip, leftKnee, leftAnkle)
rightKneeAngle = angle(rightHip, rightKnee, rightAnkle)
averageKneeAngle = average of confident visible side angles
```

Basic thresholds:

```text
STANDING position:
averageKneeAngle > 160 degrees

SQUAT DOWN position:
averageKneeAngle < 100 degrees
```

Counting rule:

```text
Standing → Down → Standing = 1 squat
```

Pseudo-logic:

```ts
if (exercise === "squat") {
  if (averageKneeAngle > 160) {
    currentState = "up";
  } else if (averageKneeAngle < 100) {
    currentState = "down";
  } else {
    currentState = "middle";
  }

  if (previousState === "up" && currentState === "down") {
    repStarted = true;
  }

  if (repStarted && previousState === "down" && currentState === "up") {
    incrementSquatCount();
    repStarted = false;
  }

  previousState = currentState;
}
```

---

# 9. Local Global Counters

Store global totals locally in browser storage.

Storage keys:

```ts
exercise_totals = {
  pushups: number,
  squats: number
}
```

Example:

```ts
const STORAGE_KEY = "exercise_counter_totals";

type ExerciseTotals = {
  pushups: number;
  squats: number;
};

function loadTotals(): ExerciseTotals {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      pushups: 0,
      squats: 0,
    };
  }

  return JSON.parse(raw);
}

function saveTotals(totals: ExerciseTotals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(totals));
}
```

When a push-up is counted:

```ts
sessionPushups += 1;
totals.pushups += 1;
saveTotals(totals);
```

When a squat is counted:

```ts
sessionSquats += 1;
totals.squats += 1;
saveTotals(totals);
```

---

# 10. Data Model

```ts
type ExerciseType = "pushup" | "squat";

type PoseState = "up" | "down" | "middle" | "unknown";

type ExerciseCounterState = {
  selectedExercise: ExerciseType;
  sessionPushups: number;
  sessionSquats: number;
  totalPushups: number;
  totalSquats: number;
  currentPoseState: PoseState;
  previousPoseState: PoseState;
  repStarted: boolean;
  isCameraActive: boolean;
  isPersonDetected: boolean;
};
```

---

# 11. Detection Quality Rules

To avoid false counts:

1. Only count if required landmarks are visible.
2. Ignore frames with low confidence.
3. Smooth angles over several frames.
4. Add a cooldown after each counted rep.
5. Require a full transition, not just one frame.

Recommended MVP values:

```text
Minimum landmark visibility: 0.5
Smoothing window: 5 frames
Rep cooldown: 500 ms
```

Example:

```ts
if (Date.now() - lastRepTimestamp < 500) {
  return;
}
```

---

# 12. Multi-Person Limitation

MVP should support only **one person in frame**.

If more than one person appears or landmarks are unstable, show warning:

```text
Please stay alone in the camera frame.
```

For better gym reliability later:

```text
Add person tracking
Add user selection
Crop to exercise area
Use object/person detector before pose detection
```

---

# 13. MVP Acceptance Criteria

The MVP is complete when:

1. User can open the app in browser.
2. User can start webcam.
3. App detects body pose using MediaPipe.
4. User can select push-up mode.
5. App counts push-ups using elbow angle transitions.
6. User can select squat mode.
7. App counts squats using knee angle transitions.
8. Session counters update immediately.
9. Global local counters are saved in browser storage.
10. Counters persist after page refresh.
11. User can reset session counter.
12. User can reset global local counters.
13. App shows basic detection status.

---

# 14. Suggested File Structure

```text
src/
  components/
    CameraView.tsx
    ExerciseSelector.tsx
    CounterPanel.tsx
    PoseOverlay.tsx

  hooks/
    useCamera.ts
    usePoseDetection.ts
    useExerciseCounter.ts
    useLocalExerciseTotals.ts

  utils/
    angles.ts
    landmarks.ts
    smoothing.ts

  types/
    exercise.ts

  App.tsx
```

---

# 15. Future Improvements

After MVP:

```text
Add automatic exercise recognition
Add ML-based pose classification
Add form quality scoring
Add voice feedback
Add workout history
Add cloud sync
Add user accounts
Add gym multi-person support
Add calibration per user
Add mobile-first UI
```

For the first version, the best approach is:

```text
MediaPipe Pose + rule-based angle detection + localStorage counters
```
