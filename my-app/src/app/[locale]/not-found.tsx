"use client";
// next.js
import Link from "next/link";
import { useParams } from "next/navigation";
// types
import { TYPE_LANGUAGE } from "../lib/config/type";

export default function NotFound() {
  const { locale } = useParams<{ locale: TYPE_LANGUAGE }>();

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
      {locale === "ja" ? (
        <>
          <p>ページが見つかりません</p>
          <Link href={`/${locale}`}>ホームページに戻る</Link>
        </>
      ) : (
        <>
          <p>Could not find the page</p>
          <Link href={`/${locale}`}>Return Home Page</Link>
        </>
      )}
    </div>
  );
}
