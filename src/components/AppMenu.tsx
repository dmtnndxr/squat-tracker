import { BarChart3, Info, Settings } from "lucide-react";
import type { ReactNode } from "react";
import type { Messages } from "../i18n/translations";

export type AppSection = "main" | "overview" | "settings" | "about";

type AppMenuProps = {
  t: Messages;
  onNavigate: (section: AppSection) => void;
};

const navItems: Array<{
  section: Exclude<AppSection, "main">;
  labelKey: "overview" | "settings" | "about";
  icon: ReactNode;
}> = [
  {
    section: "overview",
    labelKey: "overview",
    icon: <BarChart3 size={18} aria-hidden="true" />,
  },
  {
    section: "settings",
    labelKey: "settings",
    icon: <Settings size={18} aria-hidden="true" />,
  },
  {
    section: "about",
    labelKey: "about",
    icon: <Info size={18} aria-hidden="true" />,
  },
];

export function AppMenu({ t, onNavigate }: AppMenuProps) {
  return (
    <nav className="absolute left-0 top-14 w-56 overflow-hidden rounded-md border border-[#444933]/80 bg-[#131314]/95 p-2 shadow-2xl backdrop-blur-xl">
      {navItems.map((item) => (
        <button
          key={item.section}
          type="button"
          className="flex min-h-12 w-full items-center gap-3 rounded-sm px-3 text-left text-sm font-bold uppercase tracking-[0.08em] text-[#c4c9ac] transition hover:bg-[#c3f400]/15 hover:text-[#c3f400]"
          onClick={() => onNavigate(item.section)}
        >
          {item.icon}
          {t[item.labelKey]}
        </button>
      ))}
    </nav>
  );
}
