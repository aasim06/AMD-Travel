import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Geist, Outfit } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { CurrencyProvider } from "@/context/currency-context";
import NextTopLoader from "nextjs-toploader";
import { cn } from "@/lib/utils";
import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { DynamicFavicon } from "@/components/providers/dynamic-favicon";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const fontBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const fontOutfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.logo.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.logo.ogImage],
  },
};

import { ThemeColorProvider } from "@/components/providers/theme-color-provider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, fontOutfit.variable)} suppressHydrationWarning>
      <head>
        <link id="dynamic-theme-favicon" rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=localStorage.getItem("site_theme_primary_color");if(c){if(c.indexOf("#")===0){var hex=c.replace("#","");if(hex.length===3)hex=hex.split("").map(function(x){return x+x}).join("");if(hex.length===6){var r=parseInt(hex.substring(0,2),16)/255,g=parseInt(hex.substring(2,4),16)/255,b=parseInt(hex.substring(4,6),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}var hsl=Math.round(h*360)+" "+Math.round(s*100)+"% "+Math.round(l*100)+"%";document.documentElement.style.setProperty("--primary",hsl);document.documentElement.style.setProperty("--ring",hsl);}}else if(c.indexOf("%")>-1||c.split(" ").length>=3){document.documentElement.style.setProperty("--primary",c.trim());document.documentElement.style.setProperty("--ring",c.trim());}}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} ${fontOutfit.variable} font-outfit bg-background text-foreground antialiased overflow-x-hidden w-full max-w-full`}
      >
        <ThemeColorProvider>
          <DynamicFavicon />
          <ThemeProvider>
            <SidebarProvider>
              <CurrencyProvider>
                <NextTopLoader
                  color="hsl(var(--primary))"
                  height={3}
                  shadow="0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))"
                  showSpinner={false}
                />
                <SmoothScrollProvider>
                  <MainLayoutWrapper>{children}</MainLayoutWrapper>
                </SmoothScrollProvider>
              </CurrencyProvider>
            </SidebarProvider>
          </ThemeProvider>
        </ThemeColorProvider>
      </body>
    </html>
  );
}
