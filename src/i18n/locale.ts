import type { Locale } from "./translations";

export const LOCALE_STORAGE_KEY = "exercise_counter_locale";

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "ru";
}

export function detectLocale(languages: readonly string[] = navigator.languages): Locale {
  for (const language of languages) {
    const normalizedLanguage = language.toLowerCase();

    if (normalizedLanguage.startsWith("ru")) {
      return "ru";
    }

    if (normalizedLanguage.startsWith("en")) {
      return "en";
    }
  }

  return "en";
}

export function loadLocale(storage: Storage = localStorage): Locale {
  const saved = storage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(saved) ? saved : detectLocale();
}

export function saveLocale(locale: Locale, storage: Storage = localStorage): void {
  storage.setItem(LOCALE_STORAGE_KEY, locale);
}
