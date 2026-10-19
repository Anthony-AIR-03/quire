import { createIsomorphicFn } from "@tanstack/react-start";
import { serverEnv } from "./server-env";

/**
 * This site's public origin, for absolute links in link previews (og:image must be absolute).
 * On the server it comes from BETTER_AUTH_URL, the address the site is served at; in the
 * browser it is the page's own origin. Empty when unknown, so links stay relative.
 */
export const siteOrigin = createIsomorphicFn()
  .server(() => {
    const configured = serverEnv("BETTER_AUTH_URL");
    if (!configured) return "";
    try {
      return new URL(configured).origin;
    } catch {
      return "";
    }
  })
  .client(() => window.location.origin);

export const OG_IMAGE = { path: "/og-image.png", width: 1200, height: 630 } as const;
