import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { absoluteUrl, BUSINESS, OG_IMAGE } from "../lib/site";

/**
 * Title and description are tuned for local intent — the searches this business
 * can realistically win are "car rental Dallas" / "SUV rental Dallas TX", not
 * the national head terms Enterprise and Hertz own. The city and state lead so
 * they survive Google's ~60-character title truncation.
 */
const DEFAULT_TITLE = "Car & SUV Rental in Dallas, TX | Royalty Luxury Transportation Services";

const DEFAULT_DESCRIPTION =
  "Affordable car and SUV rentals in Dallas, Texas. Economy sedans from $69/day and premium full-size Suburbans for family trips, airport runs, and business travel. Daily and weekly rates, serving the DFW metroplex. Renters must be 25+.";

/** Approximate centre of ZIP 75235 — replace if an exact address is published. */
const DALLAS_ICBM = "32.8265, -96.8479";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "author", content: BUSINESS.name },
      { name: "theme-color", content: "#0b0d10" },

      // --- Local SEO: this is a Dallas-based rental, not a national brand ----
      { name: "geo.region", content: "US-TX" },
      { name: "geo.placename", content: `${BUSINESS.city}, ${BUSINESS.regionName}` },
      { name: "ICBM", content: DALLAS_ICBM },

      // --- Open Graph -------------------------------------------------------
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: BUSINESS.name },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: absoluteUrl("/") },
      // Without og:image, scrapers fall back to guessing the largest <img> on
      // the page — which picked a random hero car photo instead of the brand.
      { property: "og:image", content: absoluteUrl(OG_IMAGE.path) },
      { property: "og:image:secure_url", content: absoluteUrl(OG_IMAGE.path) },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: String(OG_IMAGE.width) },
      { property: "og:image:height", content: String(OG_IMAGE.height) },
      { property: "og:image:alt", content: OG_IMAGE.alt },

      // --- Twitter/X --------------------------------------------------------
      // summary_large_image promises a large image, so twitter:image is not
      // optional here: without it the card renders as bare text.
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: DEFAULT_TITLE },
      { name: "twitter:description", content: DEFAULT_DESCRIPTION },
      { name: "twitter:image", content: absoluteUrl(OG_IMAGE.path) },
      { name: "twitter:image:alt", content: OG_IMAGE.alt },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: absoluteUrl("/") },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon-512.png" },
      { rel: "apple-touch-icon", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
