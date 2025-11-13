"use client";
import Link from "next/link";
import { useContext } from "react";
import { LanguageContext } from "./lib/providers";

export default function NotFound() {
  const languageContext = useContext(LanguageContext);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <h1>Not found</h1>
      {languageContext?.language === "ja" ? (
        <>
          <p>ページが見つかりません</p>
          <Link href="/">ホームページに戻る</Link>
        </>
      ) : (
        <>
          <p>Could not find the page</p>
          <Link href="/">Return Home Page</Link>
        </>
      )}
    </div>
  );
}
