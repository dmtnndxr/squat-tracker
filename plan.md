# Browser Exercise Counter MVP

## Summary

  Build a greenfield Vite + React + TypeScript web app that uses the webcam, MediaPipe Pose Landmarker, rule-based angle thresholds, and localStorage to count push-ups and squats. The
  first screen is the usable camera/counting app, with no backend, accounts, routing, or cloud storage.

## Key Changes

- Scaffold a Vite React TypeScript app in this repo with standard scripts: dev, build, preview, and test tooling if feasible.
- Add MediaPipe Tasks Vision pose detection using @mediapipe/tasks-vision.
- Implement these core UI areas:
  - Camera preview with optional skeleton/landmark canvas overlay.
  - Exercise selector for Push-ups and Squats.
  - Status panel showing camera state, detection state, current pose state, session count, and local totals.
  - Controls for start camera, stop camera, reset session, and reset local totals.
- Implement typed exercise state:
  - ExerciseType = "pushup" | "squat"
  - PoseState = "up" | "down" | "middle" | "unknown"
  - local totals persisted under exercise_counter_totals.

## Implementation Details

- Camera:
  - Use navigator.mediaDevices.getUserMedia({ video: true }).
  - Attach stream to a mirrored <video> preview.
  - Stop all media tracks on stop/unmount.
- Pose detection:
  - Load MediaPipe Pose Landmarker in video mode.
  - Process animation frames only while the camera is active.
  - Treat no landmarks as No person detected.
  - Use the first detected pose only for MVP.
- Counting:
  - Add calculateAngle(a, b, c) where b is the joint.
  - For push-ups, average visible left/right elbow angles:
    - up when angle > 150
    - down when angle < 95
    - otherwise middle
  - For squats, average visible left/right knee angles:
    - up when angle > 160
    - down when angle < 100
    - otherwise middle
  - Count one rep only after up -> down -> up.
  - Require landmark visibility >= 0.5.
  - Smooth angles over the latest 5 valid frames.
  - Apply a 500 ms cooldown after each counted rep.
- Storage:
  - Load totals defensively from localStorage.
  - Default malformed or missing storage to { pushups: 0, squats: 0 }.
  - Save after every counted rep and after reset.

## Test Plan

- Unit test angle calculation with straight, right-angle, and bent-joint fixtures.
- Unit test smoothing window behavior.
- Unit test exercise state transitions:
  - push-up counts after up -> down -> up
  - squat counts after up -> down -> up
  - no count for partial transitions
  - cooldown prevents duplicate counts
  - low-visibility landmarks are ignored
- Unit test local storage load/save/reset behavior, including malformed JSON fallback.
- Run npm run build to verify the production bundle compiles.

## Assumptions

- Use Vite rather than Next.js because the app is a client-only MVP with no routing or server features.
- Use localStorage, not IndexedDB.
- Use MediaPipe’s hosted WASM/assets unless the package setup makes local asset loading simpler.
- The MVP supports one person in frame and uses the first pose result when MediaPipe returns landmarks.
