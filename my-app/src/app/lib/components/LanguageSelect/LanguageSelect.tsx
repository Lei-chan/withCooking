"use client";
//react
import { useContext, useEffect, useState } from "react";
//context
import { LanguageContext } from "../../providers";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";

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
  const languageContext = useContext(LanguageContext);

  const [language, setLanguage] = useState<TYPE_LANGUAGE>(
    languageContext?.language || "en"
  );

  useEffect(() => {
    if (!languageContext?.language) return;
    setLanguage(languageContext.language);
  }, [languageContext?.language]);

  function handleChangeLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value as TYPE_LANGUAGE;
    setLanguage(value);
    languageContext?.updateLanguage(value);
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
