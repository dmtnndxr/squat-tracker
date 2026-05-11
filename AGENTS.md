# Agent Instructions

This repository is a browser fitness tracker built with React, TypeScript, Vite, Tailwind CSS, and MediaPipe Tasks Vision.

## Working Principles

- Preserve the core app behavior: camera access, pose landmark detection, repetition counting, local totals, local history, debug data, and exercise modes.
- Do not replace working pose/counting logic while doing visual work.
- Prefer small, focused React components and hooks.
- Prefer existing utilities, storage helpers, and hooks over adding parallel implementations.
- Use Tailwind CSS for layout, spacing, typography, colors, states, and responsive behavior.
- Avoid adding plain CSS unless Tailwind cannot reasonably cover the case.
- Keep the UI flat, minimal, app-like, and mostly rectangular with modest radii.
- Do not copy Figma layouts pixel-for-pixel; treat visual references as mood and palette guidance only.

## Commands

Use these commands for normal verification:

```bash
npm test
npm run build
```

Use this command for local development:

```bash
npm run dev
```

## Important Files

- `src/App.tsx` - main app shell, screen routing, settings, overview grouping, confirmations, and high-level state.
- `src/components/CameraView.tsx` - camera/test-video rendering and placeholder.
- `src/components/CounterPanel.tsx` - debug panel.
- `src/components/ExerciseSelector.tsx` - exercise tabs.
- `src/hooks/useCamera.ts` - camera and video source lifecycle.
- `src/hooks/usePoseDetection.ts` - MediaPipe pose detector loop.
- `src/hooks/useExerciseCounter.ts` - repetition counting state machine integration.
- `src/hooks/useRepHistory.ts` - local rep history and session IDs.
- `src/hooks/useLocalExerciseTotals.ts` - local total counters.
- `src/storage/` - localStorage helpers and CSV conversion.
- `src/utils/` - landmark, angle, smoothing, and counter utilities.
- `src/i18n/` - language state and translations.

## Data and Safety Rules

- Browser storage is the source for totals, history, locale, and UI settings.
- Any action that deletes, clears, or resets data must ask for confirmation with `window.confirm` or an equivalent browser alert/confirm flow.
- This includes debug-only reset and clear actions.
- Do not silently clear totals, history, loaded test videos, or session counters.
- Keep session grouping compatible with the existing `sessionId` model.

## UI Rules

- The app has four sections: Main, Overview, Settings, About.
- The Main screen is centered around the live camera preview or placeholder visual.
- The burger menu in the top-left navigates to Overview, Settings, and About.
- Squats should remain selected by default.
- The debug panel is optional, settings-controlled, collapsible, movable, and bottom-right by default.
- Use compact, rectangular controls rather than pill-heavy styling.
- Keep the existing dark/lime/cyan palette unless the task explicitly asks for a broader redesign.

## Testing Expectations

After code changes, run:

```bash
npm run build
```

Run tests when changing hooks, storage, counting, utilities, i18n, or behavior:

```bash
npm test
```

For visual-only Tailwind class adjustments, `npm run build` is the minimum check.

