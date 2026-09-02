import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07111F",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://novique-ai.com"),
  title: {
    default: "Novique — AI Intelligence Platform",
    template: "%s | Novique",
  },
  description:
    "Novique is your real-time AI intelligence platform. Track intelligence, research, company moves, weekly reports, and earn certificates through structured learning assessments.",
  keywords: [
    "AI intelligence",
    "artificial intelligence news",
    "AI updates",
    "LLM research",
    "AI learning platform",
    "AI weekly reports",
    "machine learning",
    "AI companies",
    "AI models",
  ],
  authors: [{ name: "Novique" }],
  creator: "Novique",
  publisher: "Novique",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://novique-ai.com",
    siteName: "Novique",
    title: "Novique — AI Intelligence Platform",
    description:
      "Real-time AI intelligence, weekly synthesis reports, company intelligence, and certified learning assessments for AI practitioners.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Novique AI Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novique — AI Intelligence Platform",
    description:
      "Real-time AI intelligence, weekly synthesis reports, company intelligence, and certified learning assessments.",
    images: ["/og-image.png"],
    creator: "@novique_ai",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://novique-ai.com/#organization",
      name: "Novique",
      url: "https://novique-ai.com",
      logo: "https://novique-ai.com/icon-512.png",
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": "https://novique-ai.com/#website",
      url: "https://novique-ai.com",
      name: "Novique",
      description:
        "Real-time AI intelligence platform: news, research, models, and companies connected, explained, and ranked.",
      publisher: { "@id": "https://novique-ai.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://novique-ai.com/intelligence?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="antialiased min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
