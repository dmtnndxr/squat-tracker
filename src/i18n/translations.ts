export type Locale = "en" | "ru";

export type Messages = {
  appTitle: string;
  appSubtitle: string;
  pushups: string;
  squats: string;
  pushupsLower: string;
  squatsLower: string;
  exerciseMode: string;
  cameraPreview: string;
  cameraReady: string;
  trackingActive: string;
  startCamera: string;
  stopCamera: string;
  turnOnCamera: string;
  turnOffCamera: string;
  resetSession: string;
  resetTotals: string;
  resetHistory: string;
  resetProgress: string;
  reset: string;
  exportCsv: string;
  menu: string;
  closeMenu: string;
  overview: string;
  about: string;
  main: string;
  backToMain: string;
  settings: string;
  language: string;
  english: string;
  russian: string;
  session: string;
  currentSession: string;
  allTimeTotal: string;
  allTimeShort: string;
  noRepsYet: string;
  firstRepPrompt: string;
  continueWorkoutPrompt: string;
  addMoreRepsPrompt: string;
  startExercisePrompt: string;
  counterUpdatesPrompt: string;
  totalLocalReps: string;
  totalReps: string;
  totalPushups: string;
  totalSquats: string;
  currentExercise: string;
  cameraSource: string;
  defaultCamera: string;
  cameraLabel: string;
  cameraOn: string;
  cameraOff: string;
  testVideo: string;
  clearTestVideo: string;
  loadTestVideo: string;
  noSource: string;
  unknown: string;
  stats: string;
  localOnly: string;
  repsStored: string;
  reps: string;
  noReps: string;
  activityByDay: string;
  sessionsGrouped: string;
  noSessionHistory: string;
  debugPanel: string;
  expandDebugPanel: string;
  collapseDebugPanel: string;
  debugPanelSetting: string;
  sound: string;
  on: string;
  off: string;
  model: string;
  ready: string;
  loading: string;
  position: string;
  rawStatus: string;
  angle: string;
  angleRange: string;
  thresholds: string;
  degreesShort: string;
  statusNoPersonDetected: string;
  statusBadAngle: string;
  statusDown: string;
  statusUp: string;
  statusTracking: string;
  statusDetected: string;
  poseMiddle: string;
  poseUnknown: string;
  sourceDefault: string;
  sourceAdaptive: string;
  confirmClearTestVideo: string;
  confirmResetSession: string;
  confirmResetTotals: string;
  confirmResetHistory: string;
  confirmResetProgress: string;
  unableToStartCamera: string;
  cameraSecureContextRequired: string;
  unableToLoadPoseModel: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutPrivacy: string;
  csvFileName: string;
  seoTitle: string;
  seoDescription: string;
};

export const messages: Record<Locale, Messages> = {
  en: {
    appTitle: "Rep Tracker",
    appSubtitle: "Browser workout counter",
    pushups: "Push-ups",
    squats: "Squats",
    pushupsLower: "push-ups",
    squatsLower: "squats",
    exerciseMode: "Exercise mode",
    cameraPreview: "Camera preview",
    cameraReady: "Camera ready",
    trackingActive: "Tracking active",
    startCamera: "Start camera",
    stopCamera: "Stop camera",
    turnOnCamera: "Turn on camera",
    turnOffCamera: "Turn off camera",
    resetSession: "Reset session",
    resetTotals: "Reset totals",
    resetHistory: "Reset history",
    resetProgress: "Reset progress",
    reset: "Reset",
    exportCsv: "Export CSV",
    menu: "Menu",
    closeMenu: "Close menu",
    overview: "Overview",
    about: "About",
    main: "Main",
    backToMain: "Back to main screen",
    settings: "Settings",
    language: "Language",
    english: "English",
    russian: "Russian",
    session: "Session",
    currentSession: "Current session",
    allTimeTotal: "All-time total",
    allTimeShort: "all-time",
    noRepsYet: "No reps yet",
    firstRepPrompt: "Start the camera and do your first {exercise}.",
    continueWorkoutPrompt: "Ready for another session?",
    addMoreRepsPrompt: "Start the camera and add more reps.",
    startExercisePrompt: "Start doing {exercise} to see the count here.",
    counterUpdatesPrompt: "The counter updates as a valid rep is completed.",
    totalLocalReps: "All-time total",
    totalReps: "Total reps",
    totalPushups: "Total push-ups",
    totalSquats: "Total squats",
    currentExercise: "Current exercise",
    cameraSource: "Camera",
    defaultCamera: "Default camera",
    cameraLabel: "Camera {index}",
    cameraOn: "Camera on",
    cameraOff: "Camera off",
    testVideo: "Test video",
    clearTestVideo: "Clear test video",
    loadTestVideo: "Load test video",
    noSource: "No source",
    unknown: "Unknown",
    stats: "Stats",
    localOnly: "Stored only on this device",
    repsStored: "Reps stored",
    reps: "reps",
    noReps: "0 reps",
    activityByDay: "Activity by day",
    sessionsGrouped: "Activity is grouped by workout sessions.",
    noSessionHistory: "No session history yet. Start the camera and complete reps to fill this overview.",
    debugPanel: "Debug panel",
    expandDebugPanel: "Expand debug panel",
    collapseDebugPanel: "Collapse debug panel",
    debugPanelSetting: "Debug panel",
    sound: "Sound",
    on: "On",
    off: "Off",
    model: "Model",
    ready: "Ready",
    loading: "Loading",
    position: "Position",
    rawStatus: "Raw status",
    angle: "Angle",
    angleRange: "Angle range",
    thresholds: "Thresholds",
    degreesShort: "deg",
    statusNoPersonDetected: "No person detected",
    statusBadAngle: "Bad angle",
    statusDown: "Down",
    statusUp: "Up",
    statusTracking: "Tracking",
    statusDetected: "Detected",
    poseMiddle: "Middle",
    poseUnknown: "Unknown",
    sourceDefault: "default",
    sourceAdaptive: "adaptive",
    confirmClearTestVideo: "Clear the loaded test video?",
    confirmResetSession: "Reset the current session counts?",
    confirmResetTotals: "Delete all locally stored exercise totals?",
    confirmResetHistory: "Delete all locally stored session history?",
    confirmResetProgress: "Delete all exercise totals and session history?",
    unableToStartCamera: "Unable to start camera",
    cameraSecureContextRequired:
      "Camera access requires HTTPS or localhost. Open this app over HTTPS to use the camera from another device.",
    unableToLoadPoseModel: "Unable to load pose model",
    aboutTitle: "Local exercise counter",
    aboutDescription:
      "This app uses your device camera and pose detection to count exercise repetitions locally in the browser. Choose an exercise, start the camera, and perform reps while the app tracks your session and total progress.",
    aboutPrivacy:
      "Data is saved only in your browser and may be deleted by the browser without warning. We recommend regularly exporting or backing up your data.",
    csvFileName: "exercise-history.csv",
    seoTitle: "Exercise Counter - Push-up and Squat Counter",
    seoDescription:
      "A private browser exercise counter that uses your camera to count push-ups and squats locally on your device.",
  },
  ru: {
    appTitle: "Счет повторений",
    appSubtitle: "Браузерный счетчик тренировки",
    pushups: "Отжимания",
    squats: "Приседания",
    pushupsLower: "отжимания",
    squatsLower: "приседания",
    exerciseMode: "Тип упражнения",
    cameraPreview: "Предпросмотр камеры",
    cameraReady: "Камера готова",
    trackingActive: "Отслеживание активно",
    startCamera: "Включить камеру",
    stopCamera: "Остановить камеру",
    turnOnCamera: "Включить камеру",
    turnOffCamera: "Выключить камеру",
    resetSession: "Сбросить подход",
    resetTotals: "Сбросить итоги",
    resetHistory: "Сбросить историю",
    resetProgress: "Сбросить прогресс",
    reset: "Сбросить",
    exportCsv: "Экспорт CSV",
    menu: "Меню",
    closeMenu: "Закрыть меню",
    overview: "Обзор",
    about: "О приложении",
    main: "Главная",
    backToMain: "Вернуться на главный экран",
    settings: "Настройки",
    language: "Язык",
    english: "Английский",
    russian: "Русский",
    session: "Подход",
    currentSession: "Текущий подход",
    allTimeTotal: "Всего",
    allTimeShort: "всего",
    noRepsYet: "Вы еще не упражнялись.",
    firstRepPrompt: "Включите камеру и сделайте первое {exercise}.",
    continueWorkoutPrompt: "Готовы к новому подходу?",
    addMoreRepsPrompt: "Включите камеру и начинайте упражняться.",
    startExercisePrompt: "Начните делать {exercise}, чтобы увидеть счетчик здесь.",
    counterUpdatesPrompt: "Счетчик обновляется после каждого корректного повтора.",
    totalLocalReps: "Всего",
    totalReps: "Всего повторов",
    totalPushups: "Всего отжиманий",
    totalSquats: "Всего приседаний",
    currentExercise: "Текущее упражнение",
    cameraSource: "Камера",
    defaultCamera: "Камера по умолчанию",
    cameraLabel: "Камера {index}",
    cameraOn: "Камера включена",
    cameraOff: "Камера выключена",
    testVideo: "Тестовое видео",
    clearTestVideo: "Убрать тестовое видео",
    loadTestVideo: "Загрузить тестовое видео",
    noSource: "Нет видео",
    unknown: "Неизвестно",
    stats: "Статистика",
    localOnly: "Хранится только на этом устройстве",
    repsStored: "Повторов сохранено",
    reps: "повт.",
    noReps: "0 повт.",
    activityByDay: "Активность по дням",
    sessionsGrouped: "Активность сгруппирована по тренировочным подходам.",
    noSessionHistory: "Истории подходов пока нет. Включите камеру и выполните повторы, чтобы заполнить обзор.",
    debugPanel: "Панель отладки",
    expandDebugPanel: "Развернуть панель отладки",
    collapseDebugPanel: "Свернуть панель отладки",
    debugPanelSetting: "Панель отладки",
    sound: "Звук",
    on: "Вкл",
    off: "Выкл",
    model: "Модель",
    ready: "Готова",
    loading: "Загрузка",
    position: "Позиция",
    rawStatus: "Исходный статус",
    angle: "Угол",
    angleRange: "Диапазон угла",
    thresholds: "Пороги",
    degreesShort: "град.",
    statusNoPersonDetected: "Человек не найден",
    statusBadAngle: "Плохой угол",
    statusDown: "Внизу",
    statusUp: "Вверху",
    statusTracking: "Отслеживание",
    statusDetected: "Обнаружено",
    poseMiddle: "Середина",
    poseUnknown: "Неизвестно",
    sourceDefault: "по умолчанию",
    sourceAdaptive: "адаптивно",
    confirmClearTestVideo: "Убрать загруженное тестовое видео?",
    confirmResetSession: "Сбросить счетчики текущего подхода?",
    confirmResetTotals: "Удалить все локально сохраненные итоги упражнений?",
    confirmResetHistory: "Удалить всю локально сохраненную историю подходов?",
    confirmResetProgress: "Удалить все итоги упражнений и историю подходов?",
    unableToStartCamera: "Не удалось включить камеру",
    cameraSecureContextRequired:
      "Для доступа к камере нужен HTTPS или localhost. Откройте приложение по HTTPS, чтобы использовать камеру с другого устройства.",
    unableToLoadPoseModel: "Не удалось загрузить модель позы",
    aboutTitle: "Локальный счетчик упражнений",
    aboutDescription:
      "Это приложение использует камеру устройства и распознавание позы, чтобы считать повторы упражнений локально в браузере. Выберите упражнение, включите камеру и выполняйте повторы, пока приложение отслеживает подход и общий прогресс.",
    aboutPrivacy:
      "Данные сохраняются только в вашем браузере и могут быть удалены браузером без предупреждения. Рекомендуем регулярно экспортировать или сохранять резервную копию данных.",
    csvFileName: "exercise-history.csv",
    seoTitle: "Счетчик упражнений - отжимания и приседания",
    seoDescription:
      "Приватный браузерный счетчик упражнений, который использует камеру и считает отжимания и приседания локально на устройстве.",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
