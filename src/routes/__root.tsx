import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import {
  bindLine,
  dek,
  headline,
  productName,
  shareDescription,
  shareImageAlt,
  shareTitle,
} from "../copy";
import { OG_IMAGE, siteOrigin } from "../lib/site-url";
import { READING_SETTINGS_SCRIPT } from "../reading-settings";
import appCss from "../styles.css?url";
import favicon from "../assets/favicon.svg?url";

export const Route = createRootRoute({
  head: () => {
    // Link previews need an absolute image address.
    const origin = siteOrigin();
    const image = `${origin}${OG_IMAGE.path}`;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: productName },
        { name: "description", content: `${headline} ${bindLine} ${dek}` },
        { name: "theme-color", content: "#F7F2DF" },
        // Link previews: the same card wherever a link to Quire is sent.
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: productName },
        { property: "og:title", content: shareTitle },
        { property: "og:description", content: shareDescription },
        ...(origin ? [{ property: "og:url", content: `${origin}/` }] : []),
        { property: "og:image", content: image },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: String(OG_IMAGE.width) },
        { property: "og:image:height", content: String(OG_IMAGE.height) },
        { property: "og:image:alt", content: shareImageAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: shareTitle },
        { name: "twitter:description", content: shareDescription },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: shareImageAlt },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/svg+xml", href: favicon },
      ],
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-GB" data-size="m" data-spacing="standard" suppressHydrationWarning>
      <head>
        {/* Applies the reader's paper, size and spacing before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: READING_SETTINGS_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
