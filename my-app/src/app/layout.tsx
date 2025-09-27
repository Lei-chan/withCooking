"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState, useCallback, useMemo } from "react";
import { AccessTokenContext } from "./context";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const metadata: Metadata = {
  title: "withCooking",
  description: "Application where users can use many useful tools for cooking!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState("");

  const login = useCallback((accessToken: string) => {
    setAccessToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    setAccessToken("");
  }, []);

  const contextValue = useMemo(
    () => ({ accessToken, login, logout }),
    [accessToken, login, logout]
  );

  return (
    <html lang="en">
      <body>
        <AccessTokenContext value={contextValue}>{children}</AccessTokenContext>
      </body>
    </html>
  );
}

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable}`}>
//         {children}
//       </body>
//     </html>
//   );
// }
