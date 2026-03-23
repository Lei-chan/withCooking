"use client";
//react
import { useState } from "react";
// next.js
import { useParams, usePathname, useRouter } from "next/navigation";
// types
import { TYPE_LANGUAGE, TYPE_MEDIA } from "@/app/lib/config/type";

export default function LanguageSelect({
  mediaContext,
  fontSize,
  position,
  minWidth,
  backgroundColor,
  color,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  position: "static" | "relative" | "absolute" | "sticky" | "fixed";
  minWidth: string;
  backgroundColor: string;
  color: string;
}) {
  const { locale } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [language, setLanguage] = useState(locale);

  function handleChangeLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.currentTarget.value as TYPE_LANGUAGE;
    setLanguage(newLocale);

    const pathWithoutLocale = pathname.slice(3);
    router.push(`/${newLocale}${pathWithoutLocale}`);
  }

  return (
    <select
      style={{
        position,
        backgroundImage: 'url("/icons/global.svg")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "13%",
        backgroundPositionX: "3%",
        backgroundPositionY: "center",
        backgroundColor,
        minWidth,
        maxWidth: "fit-content",
        top: "1.5%",
        left: "2.5%",
        textAlign: "center",
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        textAlignLast: "center",
        padding:
          mediaContext === "mobile" || mediaContext === "tablet"
            ? "1% 2% 1% 5%"
            : "0.5% 2%  0.5% 5%",
        border: "none",
        fontSize: `calc(${fontSize} * 0.9)`,
        color,
      }}
      value={language}
      onChange={handleChangeLanguage}
    >
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
}
