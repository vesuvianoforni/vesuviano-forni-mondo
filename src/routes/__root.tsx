import { Suspense, useEffect, type ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  type ErrorComponentProps,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { SeoOwnerProvider } from "@/lib/seoOwner";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConsultationModalProvider } from "@/contexts/ConsultationModalContext";
import ClarityPageView from "@/components/ClarityPageView";
import PublicEngagement from "@/components/PublicEngagement";
import NotFound from "@/pages/NotFound";
import { captureAttribution } from "@/lib/attribution";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { SITE_STRUCTURED_DATA } from "@/lib/siteStructuredData";
import { detectLangFromPath, loadLanguage } from "@/i18n/config";
import appCss from "../styles.css?url";

const SITE = "https://vesuvianoforni.com";

// Deferred third-party loaders, ported verbatim from the former index.html.
const CLARITY_SNIPPET = `(window.requestIdleCallback||setTimeout)(function(){
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script","tclp11ayhu");
}, {timeout: 3000});`;

const FONTS_AND_ANALYTICS_SNIPPET = `requestAnimationFrame(function() {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
});
function vfLoadAnalytics() {
  setTimeout(function() {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MDPBPR29');
    var ga=document.createElement('script');ga.async=true;
    ga.src='https://www.googletagmanager.com/gtag/js?id=G-EJPHCZPXTR';
    document.head.appendChild(ga);
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());gtag('config','G-EJPHCZPXTR');
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1313336124052811');
    fbq('track', 'PageView');
  }, 2000);
}
if (document.readyState === 'complete') vfLoadAnalytics();
else window.addEventListener('load', vfLoadAnalytics);`;

const HREFLANGS = ["it", "en", "fr", "de", "es"] as const;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    await loadLanguage(detectLangFromPath(location.pathname));
    return {};
  },
  head: ({ match }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "author", content: "Vesuviano Forni" },
      { name: "google-site-verification", content: "m2JEhd_gkm8hD14ME0U9AGRgWeF7xPG1RQY3zIpcnw8" },
      { name: "geo.region", content: "IT-NA" },
      { name: "geo.placename", content: "Napoli" },
      { name: "geo.position", content: "40.8518;14.2681" },
      { name: "ICBM", content: "40.8518, 14.2681" },
      { name: "msapplication-TileColor", content: "#d4631a" },
      { name: "theme-color", content: "#d4631a" },
      { name: "x-debug-path", content: String(match?.pathname ?? "none") },
      {
        name: "x-debug-last",
        content: String(matches?.[matches.length - 1]?.pathname ?? "none"),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      {
        rel: "manifest",
        href: match.pathname.startsWith("/erp") ? "/erp-manifest.json" : "/manifest.json",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
    scripts: [
      ...SITE_STRUCTURED_DATA.map((data) => ({
        type: "application/ld+json",
        children: JSON.stringify(data),
      })),
      { children: CLARITY_SNIPPET },
      { children: FONTS_AND_ANALYTICS_SNIPPET },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = detectLangFromPath(pathname);
  return (
    <html lang={lang} prefix="og: https://ogp.me/ns#" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MDPBPR29"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://www.facebook.com/tr?id=1313336124052811&ev=PageView&noscript=1"
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vesuviano-600"></div>
  </div>
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // ported from main.tsx: capture traffic source (utm_*, gclid, fbclid) from the landing URL.
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <HelmetProvider>
      <SeoOwnerProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ConsultationModalProvider>
            <ClarityPageView />
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
            <PublicEngagement />
          </ConsultationModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
      </SeoOwnerProvider>
    </HelmetProvider>
  );
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-playfair font-semibold">This page didn't load</h1>
        <p className="text-muted-foreground">Something went wrong. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <Link to="/" className="rounded-md border border-border px-4 py-2">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
