import type { Viewport } from "next";
import { Playfair_Display, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./lib/providers";

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
