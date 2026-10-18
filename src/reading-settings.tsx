import { useEffect, useState } from "react";
import {
  paperColourLabel,
  settingsSavedNote,
  spacingLabel,
  textSizeLabel,
} from "./copy";

/**
 * Reading settings: paper colour, text size and spacing. Dyslexic readers
 * often have their own colour preference (BDA 2023). Saved per device and
 * applied as data attributes on <html>, before paint, by READING_SETTINGS_SCRIPT.
 */

export const READING_KEY = "quire-reading";

export const TINTS = [
  { value: "newsprint", label: "Newsprint", swatch: "#F7F2DF" },
  { value: "cream", label: "Cream", swatch: "#FBF6E9" },
  { value: "yellow", label: "Yellow", swatch: "#FBF0C2" },
  { value: "blue", label: "Blue", swatch: "#E3EDF5" },
  { value: "grey", label: "Grey", swatch: "#ECECE8" },
  { value: "night", label: "Night", swatch: "#1B1A16" },
] as const;

export const SIZES = [
  { value: "s", label: "Small" },
  { value: "m", label: "Standard" },
  { value: "l", label: "Large" },
  { value: "xl", label: "Largest" },
] as const;

export const SPACINGS = [
  { value: "standard", label: "Standard" },
  { value: "wide", label: "Wide" },
] as const;

export type ReadingSettings = {
  tint?: (typeof TINTS)[number]["value"];
  size: (typeof SIZES)[number]["value"];
  spacing: (typeof SPACINGS)[number]["value"];
};

const defaults: ReadingSettings = { size: "m", spacing: "standard" };

/**
 * Runs in <head> before the page paints, so a chosen paper never flashes.
 * No tint chosen: the paper follows the device's light or dark setting.
 */
export const READING_SETTINGS_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("${READING_KEY}")||"{}"),d=document.documentElement;if(s.tint)d.dataset.tint=s.tint;if(s.size)d.dataset.size=s.size;if(s.spacing)d.dataset.spacing=s.spacing;}catch(e){}})();`;

function load(): ReadingSettings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(READING_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

function apply(settings: ReadingSettings) {
  const root = document.documentElement;
  if (settings.tint) root.dataset.tint = settings.tint;
  else delete root.dataset.tint;
  root.dataset.size = settings.size;
  root.dataset.spacing = settings.spacing;
}

/** The settings panel. A disclosure under the bar, not a pop-up: the page stays in view. */
export function ReadingSettingsPanel({ id, open }: { id: string; open: boolean }) {
  const [settings, setSettings] = useState<ReadingSettings>(defaults);
  // With no paper chosen the page follows the device, so show the paper it is actually on.
  const [devicePaper, setDevicePaper] = useState<"newsprint" | "night">("newsprint");

  useEffect(() => {
    setSettings(load());
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => setDevicePaper(dark.matches ? "night" : "newsprint");
    follow();
    dark.addEventListener("change", follow);
    return () => dark.removeEventListener("change", follow);
  }, []);

  function choose(next: Partial<ReadingSettings>) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    apply(merged);
    try {
      localStorage.setItem(READING_KEY, JSON.stringify(merged));
    } catch {
      // Private windows may refuse storage; the choice still applies to this page.
    }
  }

  return (
    <section className="settings" id={id} hidden={!open} aria-label="Reading settings">
      <div className="settings-inner">
        <fieldset>
          <legend>{paperColourLabel}</legend>
          <div className="chips">
            {TINTS.map((tint) => (
              <label className="chip" key={tint.value}>
                <input
                  type="radio"
                  name="tint"
                  value={tint.value}
                  checked={(settings.tint ?? devicePaper) === tint.value}
                  onChange={() => choose({ tint: tint.value })}
                />
                <span>
                  <i className="swatch" style={{ background: tint.swatch }} />
                  {tint.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{textSizeLabel}</legend>
          <div className="chips">
            {SIZES.map((size) => (
              <label className="chip" key={size.value} data-size-preview={size.value}>
                <input
                  type="radio"
                  name="size"
                  value={size.value}
                  checked={settings.size === size.value}
                  onChange={() => choose({ size: size.value })}
                />
                <span>{size.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{spacingLabel}</legend>
          <div className="chips">
            {SPACINGS.map((spacing) => (
              <label className="chip" key={spacing.value} data-spacing-preview={spacing.value}>
                <input
                  type="radio"
                  name="spacing"
                  value={spacing.value}
                  checked={settings.spacing === spacing.value}
                  onChange={() => choose({ spacing: spacing.value })}
                />
                <span>{spacing.label}</span>
              </label>
            ))}
          </div>
          <p className="small muted settings-note">{settingsSavedNote}</p>
        </fieldset>
      </div>
    </section>
  );
}
