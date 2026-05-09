import { describe, expect, it } from "vitest";
import { detectLocale, loadLocale, saveLocale } from "./locale";

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("locale detection", () => {
  it("uses Russian for ru browser locales", () => {
    expect(detectLocale(["ru-RU", "en-US"])).toBe("ru");
  });

  it("falls back to English for unsupported browser locales", () => {
    expect(detectLocale(["de-DE", "fr-FR"])).toBe("en");
  });

  it("loads a saved locale before browser detection", () => {
    const storage = createStorage();

    saveLocale("ru", storage);

    expect(loadLocale(storage)).toBe("ru");
  });
});
