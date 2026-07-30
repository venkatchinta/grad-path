import {
  applyAppearance,
  saveAppearance,
  THEMES,
  type Appearance,
  type Mode,
} from "./theme.js";

const MODES: Array<{ id: Mode; label: string; icon: string }> = [
  { id: "system", label: "System", icon: "🖥️" },
  { id: "light", label: "Light", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
];

export function ThemeControls(props: {
  appearance: Appearance;
  onChange: (a: Appearance) => void;
}) {
  const update = (next: Appearance) => {
    applyAppearance(next);
    saveAppearance(next);
    props.onChange(next);
  };

  return (
    <div className="theme-controls">
      <label className="theme-select-label">
        <span>Theme</span>
        <select
          value={props.appearance.themeId}
          onChange={(e) => update({ ...props.appearance, themeId: e.target.value })}
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <div
        className="mode-toggle"
        role="group"
        aria-label="Light or dark mode"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={props.appearance.mode === m.id ? "active" : ""}
            aria-pressed={props.appearance.mode === m.id}
            title={m.label}
            onClick={() => update({ ...props.appearance, mode: m.id })}
          >
            <span aria-hidden="true">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
