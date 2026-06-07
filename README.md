# Squat Tracker

[Open the app](https://dmtnndxr.github.io/squat-tracker/)

A local browser-based squat counter for keeping a small daily activity baseline at home. It is useful when a walk or treadmill workout is not practical: do squats, let the app count repetitions from a live camera feed and keep working or watching video content without tracking the count manually.

For example, the project started from a simple personal goal: do 400 squats per day and know exactly whether the daily norm is done, without sending video or history to a server. Pose detection runs locally in the browser with MediaPipe Tasks Vision.

## How it works

The app reads your live camera stream in the browser, runs a local pose model on each frame, evaluates the squat movement, and increments the counter when a full repetition is detected.

## Features

- Counts squats; push-up tracking is available as an experimental extra mode.
- Tracks the current session count, local totals, and repetition history.
- Groups history by day and session, with CSV export.

## Data

All user data is stored in the browser: totals, repetition history, selected language, exercise, sound setting, and debug panel state. Camera input and pose detection are processed locally.
