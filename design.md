# Squat Tracker: current interface description and design approaches

## Application context

`squat-tracker` is a browser-based fitness exercise counter. Main scenario: the user turns on the camera, selects an exercise, performs push-ups or squats, and the application counts reps locally using video analysis and pose detection.

Data is stored only on the user's device.

## General design approach

The interface is built as a full-screen HUD over the camera. The camera is the main background and working context. All controls are overlaid on top of the video so the user can train without switching between screens.

The design is closer to a sports utility interface: minimal decoration, maximum readability, and quick actions.

## Main screen structure

### 1. Camera Layer

- Full-screen camera block.
- Video and canvas occupy the entire screen.
- Video proportions must be preserved.
- When the camera is active, the image is mirrored via
- Canvas is used to render pose landmarks.
- If there is no video source, the `Camera preview` placeholder is shown - or some beautiful animation of a person exercising. I may generate it separately.

### 2. HUD Layer

- Fixed overlay on top of the camera.
- A grid of three zones:
  - top panel with the application name and menu;
  - central counter;
  - bottom area with exercise selection and camera actions.

### 3. Debug

- In debug mode, an additional status panel is shown - controlled through settings.
- Includes test video upload, file status, pose detection metrics, angles, thresholds, and model state.

## Key interface components

### CameraView

- Responsible for full-screen video, canvas, camera errors, and pose detection errors.
- In debug mode, allows loading a test video.
- Shows errors in a fixed alert block at the top left.
- Errors are styled as a light red banner.

### HUD Topbar

Left side:

- small uppercase subtitle;
- large application title.

Right side:

- menu icon

The title has a text-shadow for readability over the video.

### Central counter

- The most important interface element.
- Shows the selected exercise and the number of reps in the current set.

### ExerciseSelector

- Segmented control with two options:
  - Push-ups / Отжимания
  - Squats / Приседания

### Action Buttons

Main actions:

- Start camera
- Stop camera

### AppMenu

Contains:

- Settings title;
- `Stored only on this device` subtitle;
- language selector;
- number of saved reps;
- Export CSV;
- Reset totals;
- Reset history.
- enable debug panel

### CounterPanel

- Dev panel fixed at the bottom right.
- Shows:
  - current exercise;
  - video source status;
  - current set counter;
  - total push-ups;
  - total squats;
  - model state;
  - detection status;
  - pose state;
  - angle;
  - angle range;
  - thresholds.
- Used as a diagnostic panel, not as the main user interface.

## Responsiveness

The interface is designed for a mobile-first use case

## UX priorities

Main priorities of the current interface:

- camera and counter are always visible;
- main actions are available with one tap;
- current count is as large and readable as possible;
- privacy is clearly stated in the menu: data is stored only on the device;
- the interface does not require navigation between pages;
- debug tools are separated from the production UI.
