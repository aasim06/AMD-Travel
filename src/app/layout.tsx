import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Geist } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { CurrencyProvider } from "@/context/currency-context";
import NextTopLoader from "nextjs-toploader";
import { cn } from "@/lib/utils";

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
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [siteConfig.logo.ogImage],
    locale: "en_US",
    type: "website",
  },
};

import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} font-body bg-background text-foreground antialiased overflow-x-hidden w-full max-w-full`}
      >
        <CurrencyProvider>
          <NextTopLoader
            color="#ff8a3d"
            height={3}
            shadow="0 0 10px #ff8a3d, 0 0 5px #ff8a3d"
            showSpinner={false}
          />
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </CurrencyProvider>
      </body>
    </html>
  );
}

