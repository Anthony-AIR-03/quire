/**
 * Drawn line icons: 24 grid, 2 stroke, round ends. Always next to a word,
 * never on their own (docs/brand §8).
 */

const PATHS = {
  parallel: "M4 8h16M4 16h16",
  contrast: "M4 8h14l-3-3M20 16H6l3 3",
  unplaced: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.2v.1",
  out: "M14 5h5v5M19 5l-8 8M18 14v5H5V6h5",
  text: "M3 19 8 5l5 14M4.8 14h6.4M15 19v-6.5a3 3 0 0 1 6 0V19M15 15.5h6",
  print: "M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  wait: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  alert: "M12 3 2 20h20L12 3zM12 10v4M12 17v.1",
  ribbon: "M7 3h10v18l-5-4-5 4z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Stance icons, paired with the stance words in copy.ts. */
export const stanceIcon = {
  comparable: "parallel",
  contrarian: "contrast",
  inconclusive: "unplaced",
} as const satisfies Record<string, IconName>;
