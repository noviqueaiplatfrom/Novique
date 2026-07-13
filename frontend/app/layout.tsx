import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

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
  metadataBase: new URL("https://novique.ai"),
  title: {
    default: "Novique — AI Intelligence Platform",
    template: "%s | Novique",
  },
  description:
    "Novique is your real-time AI intelligence platform. Track signals, research, company moves, weekly reports, and earn certificates through structured learning assessments.",
  keywords: [
    "AI intelligence",
    "artificial intelligence news",
    "AI signals",
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
    url: "https://novique.ai",
    siteName: "Novique",
    title: "Novique — AI Intelligence Platform",
    description:
      "Real-time AI signals, weekly synthesis reports, company intelligence, and certified learning assessments for AI practitioners.",
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
      "Real-time AI signals, weekly synthesis reports, company intelligence, and certified learning assessments.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="antialiased min-h-screen">
        {/* Google Analytics Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NCQCYSZ4QT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NCQCYSZ4QT');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
