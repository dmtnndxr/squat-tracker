# Squat Tracker

A private browser fitness-tracking app that uses the device camera and pose detection to count exercise repetitions locally.

The app currently supports:

- Squats
- Push-ups
- Live camera pose detection
- Test-video loading from the debug panel
- Per-session counts
- Local lifetime totals
- Local rep history grouped into sessions and days
- CSV export
- English/Russian language setting
- Optional debug panel

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- MediaPipe Tasks Vision
- Vitest
- lucide-react icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Preview the production build:

```bash
npm run preview
```

## App Structure

Important source paths:

- `src/App.tsx` - main UI shell, page navigation, settings, overview, and app-level state wiring.
- `src/components/CameraView.tsx` - live video/canvas surface and camera placeholder.
- `src/components/CounterPanel.tsx` - optional debug panel with pose status, angle data, resets, and test-video loading.
- `src/components/ExerciseSelector.tsx` - push-up/squat switch.
- `src/hooks/useCamera.ts` - camera stream and test-video source management.
- `src/hooks/usePoseDetection.ts` - MediaPipe model setup and pose evaluation loop.
- `src/hooks/useExerciseCounter.ts` - repetition transition/counting state.
- `src/hooks/useLocalExerciseTotals.ts` - persisted total rep counts.
- `src/hooks/useRepHistory.ts` - persisted rep history and session IDs.
- `src/storage/` - localStorage serialization helpers.
- `src/utils/` - pose angles, smoothing, landmarks, and counter transition logic.
- `src/i18n/` - locale persistence and translations.

## Local Storage

The app stores data only in the browser:

- Total push-ups and squats
- Rep history entries
- Language
- UI settings such as debug panel and sound toggles

Camera processing runs locally in the browser. The app does not upload camera frames or exercise data.

## Current UI Model

The app is organized into four sections:

- `Main` - camera preview, selected exercise, current session counter, total count fallback, camera button, and exercise switch.
- `Overview` - total reps, per-exercise totals, local activity grouped by day/session, CSV export.
- `Settings` - language, debug panel, and sound settings.
- `About` - short product description.

Navigation starts from the burger menu in the top-left of the Main screen.

## Debug Panel

The debug panel is controlled from Settings. When enabled, it:

- Appears in the bottom-right corner by default
- Can be collapsed
- Can be dragged around the viewport
- Shows model, pose status, angle, thresholds, and totals
- Provides a test-video loader
- Asks for confirmation before destructive actions

## Development Notes

- Prefer Tailwind utility classes for UI styling.
- Keep the pose detection and counting logic stable when changing visuals.
- Ask for confirmation before deleting, clearing, or resetting local data.
- Squats are the default exercise mode.
- Session history is derived from rep entries grouped by `sessionId`.

