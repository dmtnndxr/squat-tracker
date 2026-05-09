import { useCallback, useEffect, useMemo, useState } from "react";
import { getMessages, type Locale } from "../i18n/translations";
import { loadLocale, saveLocale } from "../i18n/locale";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(loadLocale());
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    saveLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const t = useMemo(() => getMessages(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.seoTitle;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = t.seoDescription;
    }
  }, [locale, t]);

  return {
    locale,
    setLocale,
    t,
  };
}
