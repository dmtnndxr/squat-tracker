# Squat Tracker

A local browser-based exercise counter. The app uses a live camera feed or an uploaded test video, detects body pose with MediaPipe Tasks Vision, and counts repetitions without sending video or history to a server.

The project is under active development: the interface and counting logic are still being refined, but the core workflow already works.

## Features

- Counts squats and push-ups.
- Supports a live camera feed, test video upload, and a canvas overlay with pose landmarks.
- Tracks the current session count, local totals, and repetition history.
- Groups history by day and session, with CSV export.
- Includes EN/RU language, sound, and debug panel settings.
- Asks for confirmation before resetting progress, totals, the session, or a test video.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, MediaPipe Tasks Vision, Vitest, lucide-react.

## Structure

- `src/App.tsx` - main shell, Main/Overview/Settings/About navigation, settings, history, sound, and confirmations.
- `src/components/` - menu, camera/video preview, exercise selector, and debug panel.
- `src/hooks/` - camera, pose detection, repetition counter, totals, history, and locale.
- `src/storage/` - localStorage helpers and history CSV export.
- `src/utils/` - angles, landmarks, adaptive thresholds, smoothing, frame loop, and counter transitions.
- `src/i18n/` - English and Russian UI copy.
- `public/squat.png`, `public/pushup.png` - placeholder images shown before a video source starts.

## Data

All user data is stored in the browser: totals, repetition history, selected language, exercise, sound setting, and debug panel state. Camera input and pose detection are processed locally.
