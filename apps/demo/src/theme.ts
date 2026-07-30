// Appearance: which color theme, and light/dark/system mode.
//
// Themes are defined in styles.css as [data-theme="..."] token blocks. This
// module is the registry + persistence + the function that applies a choice to
// the document. To add a theme: add a CSS block and a row here.

export interface ThemeMeta {
  id: string;
  label: string;
  /** Representative color for the picker swatch. */
  swatch: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "professional", label: "Professional Blue", swatch: "#1a56c4" },
  { id: "forest", label: "Forest Green", swatch: "#14532d" },
];

export type Mode = "system" | "light" | "dark";

export interface Appearance {
  themeId: string;
  mode: Mode;
}

export const DEFAULT_APPEARANCE: Appearance = {
  themeId: "professional",
  mode: "system",
};

const KEY = "gradpath-appearance-v1";

export function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Appearance>;
      const themeId = THEMES.some((t) => t.id === saved.themeId)
        ? (saved.themeId as string)
        : DEFAULT_APPEARANCE.themeId;
      const mode: Mode =
        saved.mode === "light" || saved.mode === "dark" || saved.mode === "system"
          ? saved.mode
          : DEFAULT_APPEARANCE.mode;
      return { themeId, mode };
    }
  } catch {
    /* unavailable storage falls through to default */
  }
  return { ...DEFAULT_APPEARANCE };
}

export function saveAppearance(a: Appearance): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* private mode / quota — still applies for the session */
  }
}

/** Apply a choice to <html>: data-theme picks the palette; color-scheme the mode. */
export function applyAppearance(a: Appearance): void {
  const root = document.documentElement;
  root.dataset.theme = a.themeId;
  root.style.colorScheme = a.mode === "system" ? "light dark" : a.mode;
}
