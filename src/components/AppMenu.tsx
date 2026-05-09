import { Download, Globe2, MoreVertical, Trash2, X } from "lucide-react";
import type { Locale, Messages } from "../i18n/translations";

type AppMenuProps = {
  t: Messages;
  locale: Locale;
  historyCount: number;
  onLocaleChange: (locale: Locale) => void;
  onExportCsv: () => void;
  onResetTotals: () => void;
  onResetHistory: () => void;
};

export function AppMenu({
  t,
  locale,
  historyCount,
  onLocaleChange,
  onExportCsv,
  onResetTotals,
  onResetHistory,
}: AppMenuProps) {
  return (
    <details className="app-menu">
      <summary aria-label={t.menu}>
        <MoreVertical size={22} aria-hidden="true" />
      </summary>
      <div className="menu-panel">
        <div className="menu-header">
          <strong>{t.settings}</strong>
          <span>{t.localOnly}</span>
        </div>

        <label className="menu-field">
          <span>
            <Globe2 size={16} aria-hidden="true" />
            {t.language}
          </span>
          <select value={locale} onChange={(event) => onLocaleChange(event.target.value as Locale)}>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </label>

        <div className="menu-stat">
          <span>{t.repsStored}</span>
          <strong>{historyCount}</strong>
        </div>

        <button type="button" className="menu-button" onClick={onExportCsv} disabled={historyCount === 0}>
          <Download size={18} aria-hidden="true" />
          {t.exportCsv}
        </button>
        <button type="button" className="menu-button danger" onClick={onResetTotals}>
          <Trash2 size={18} aria-hidden="true" />
          {t.resetTotals}
        </button>
        <button type="button" className="menu-button danger" onClick={onResetHistory} disabled={historyCount === 0}>
          <X size={18} aria-hidden="true" />
          {t.resetHistory}
        </button>
      </div>
    </details>
  );
}
