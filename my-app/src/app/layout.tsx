import type { Metadata } from "next";
import { Playfair_Display, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./lib/providers";

const playfairDisplay = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
  fallback: ["Noto Serif JP", "serif"],
});

// const notoSerifJp = Noto_Serif_JP({
//   weight: "400",
//   fallback: ["serif"],
// });

// const playfair = Playfair({
//   subsets: ["latin"],
//   fallback: ["serif"],
// });

export const metadata: Metadata = {
  title: "withCooking",
  description: "Application where users can use many useful tools for cooking!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-gramm="false" data-gramm_editor="false">
      <body className={playfairDisplay.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
