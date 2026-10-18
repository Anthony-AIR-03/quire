import { NAMEPLATE_PATH, NAMEPLATE_VIEWBOX } from "./lib/nameplate";

/**
 * The nameplate: "Quire" in Grenze Gotisch SemiBold, outlined (docs/brand).
 * The only blackletter anywhere. Drawn in currentColor so it follows the paper.
 */

export function Nameplate({ className, label = "Quire" }: { className?: string; label?: string }) {
  return (
    <svg
      className={["nameplate", className].filter(Boolean).join(" ")}
      viewBox={NAMEPLATE_VIEWBOX}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path fill="currentColor" d={NAMEPLATE_PATH} />
    </svg>
  );
}

/** Thick over thin, or thin over thick below the masthead. */
export function OxfordRule({ flip = false }: { flip?: boolean }) {
  return <hr className={flip ? "oxford flip" : "oxford"} />;
}
