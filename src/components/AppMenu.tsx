import { BarChart3, ChevronDown, Database, Download, Globe2, MoreVertical, Trash2, X } from "lucide-react";
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
  const formattedCount = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(historyCount);

  return (
    <details className="app-menu">
      <summary aria-label={t.menu}>
        <MoreVertical size={22} aria-hidden="true" />
      </summary>
      <div className="menu-panel">
        <div className="menu-header">
          <div>
            <strong>{t.settings}</strong>
            <span>{t.localOnly}</span>
          </div>
          <X size={14} aria-hidden="true" />
        </div>

        <section className="settings-section metrics-section" aria-label={t.stats}>
          <h2>
            <BarChart3 size={16} aria-hidden="true" />
            PERFORMANCE METRICS
          </h2>
          <div className="metric-callout">
            <span>{t.repsStored}</span>
            <p>
              <strong>{formattedCount}</strong>
              <em>REPS_TOTAL</em>
            </p>
          </div>
        </section>

        <section className="settings-grid" aria-label="Configuration">
          <label className="menu-field">
            <span>
              <Globe2 size={16} aria-hidden="true" />
              {t.language}
            </span>
            <span className="select-shell">
              <select value={locale} onChange={(event) => onLocaleChange(event.target.value as Locale)}>
                <option value="en">English (US)</option>
                <option value="ru">Русский</option>
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </span>
          </label>

          <div className="menu-field">
            <span>
              <Database size={16} aria-hidden="true" />
              SYSTEM CONFIG
            </span>
            <button type="button" className="debug-toggle" aria-pressed="false">
              <span>Enable Debug Panel</span>
              <i aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="settings-section" aria-label="Data management">
          <h2>
            <Database size={16} aria-hidden="true" />
            DATA MANAGEMENT
          </h2>
          <button type="button" className="menu-button export-csv" onClick={onExportCsv} disabled={historyCount === 0}>
            {t.exportCsv}
            <Download size={16} aria-hidden="true" />
          </button>
          <div className="reset-grid">
            <button type="button" className="menu-button danger" onClick={onResetTotals}>
              <Trash2 size={16} aria-hidden="true" />
              {t.resetTotals}
            </button>
            <button type="button" className="menu-button danger" onClick={onResetHistory} disabled={historyCount === 0}>
              <X size={16} aria-hidden="true" />
              {t.resetHistory}
            </button>
          </div>
        </section>

        <footer className="settings-footer">
          <span>OPERATOR STATUS: ENCRYPTED SYNC</span>
          <span>V 4.2.0-STABLE</span>
        </footer>
      </div>
    </details>
  );
}
