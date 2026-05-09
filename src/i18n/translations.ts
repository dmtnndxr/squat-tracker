export type Locale = "en" | "ru";

export type Messages = {
  appTitle: string;
  appSubtitle: string;
  pushups: string;
  squats: string;
  exerciseMode: string;
  cameraPreview: string;
  startCamera: string;
  stopCamera: string;
  resetSession: string;
  resetTotals: string;
  resetHistory: string;
  exportCsv: string;
  menu: string;
  closeMenu: string;
  settings: string;
  language: string;
  session: string;
  totalPushups: string;
  totalSquats: string;
  currentExercise: string;
  cameraOn: string;
  cameraOff: string;
  noSource: string;
  unknown: string;
  stats: string;
  localOnly: string;
  repsStored: string;
  csvFileName: string;
  seoTitle: string;
  seoDescription: string;
};

export const messages: Record<Locale, Messages> = {
  en: {
    appTitle: "Exercise Counter",
    appSubtitle: "Browser workout counter",
    pushups: "Push-ups",
    squats: "Squats",
    exerciseMode: "Exercise mode",
    cameraPreview: "Camera preview",
    startCamera: "Start camera",
    stopCamera: "Stop camera",
    resetSession: "Reset session",
    resetTotals: "Reset totals",
    resetHistory: "Reset history",
    exportCsv: "Export CSV",
    menu: "Menu",
    closeMenu: "Close menu",
    settings: "Settings",
    language: "Language",
    session: "Session",
    totalPushups: "Total push-ups",
    totalSquats: "Total squats",
    currentExercise: "Current exercise",
    cameraOn: "Camera on",
    cameraOff: "Camera off",
    noSource: "No source",
    unknown: "Unknown",
    stats: "Stats",
    localOnly: "Stored only on this device",
    repsStored: "Reps stored",
    csvFileName: "exercise-history.csv",
    seoTitle: "Exercise Counter - Push-up and Squat Counter",
    seoDescription:
      "A private browser exercise counter that uses your camera to count push-ups and squats locally on your device.",
  },
  ru: {
    appTitle: "Счетчик упражнений",
    appSubtitle: "Браузерный счетчик тренировки",
    pushups: "Отжимания",
    squats: "Приседания",
    exerciseMode: "Тип упражнения",
    cameraPreview: "Предпросмотр камеры",
    startCamera: "Включить камеру",
    stopCamera: "Остановить камеру",
    resetSession: "Сбросить подход",
    resetTotals: "Сбросить итоги",
    resetHistory: "Сбросить историю",
    exportCsv: "Экспорт CSV",
    menu: "Меню",
    closeMenu: "Закрыть меню",
    settings: "Настройки",
    language: "Язык",
    session: "Подход",
    totalPushups: "Всего отжиманий",
    totalSquats: "Всего приседаний",
    currentExercise: "Текущее упражнение",
    cameraOn: "Камера включена",
    cameraOff: "Камера выключена",
    noSource: "Нет видео",
    unknown: "Неизвестно",
    stats: "Статистика",
    localOnly: "Хранится только на этом устройстве",
    repsStored: "Повторов сохранено",
    csvFileName: "exercise-history.csv",
    seoTitle: "Счетчик упражнений - отжимания и приседания",
    seoDescription:
      "Приватный браузерный счетчик упражнений, который использует камеру и считает отжимания и приседания локально на устройстве.",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
