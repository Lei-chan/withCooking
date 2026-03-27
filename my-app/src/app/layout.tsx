import type { Metadata, Viewport } from "next";
import { Playfair_Display, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./lib/providers";
import {
  APP_DESCRIPTION,
  APP_NAME,
  METADATA_BASE,
} from "./lib/config/settings";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  metadataBase: METADATA_BASE,
  keywords: [
    "withCooking",
    "withcooking",
    "ウィズクッキング",
    "ウィズ・クッキング",
    "cooking",
    "recipe",
    "recipe management",
    "クッキング",
    "レシピ",
    "レシピ管理",
    "料理",
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ja: "/ja",
    },
  },
  openGraph: {
    siteName: APP_NAME,
    url: "/",
    //for later
    // images: [
    //   {
    //     url: image,
    //     alt: 'withCooking',
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    // images: [image],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const playfairDisplay = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-playfair",
});

const notoSerifJp = Noto_Serif_JP({
  weight: "400",
  variable: "--font-noto-serif",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.className}  ${notoSerifJp.className}`}
    >
      <body
        style={{
          fontFamily: "var(--font-playfair), var(--font-noto-serif), serif",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
