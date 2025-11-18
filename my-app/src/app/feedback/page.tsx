"use client";
//react
import { useContext, useEffect, useState } from "react";
//next.js
import Link from "next/link";
//context
import { LanguageContext, MediaContext } from "../lib/providers";
//type
import { TYPE_LANGUAGE } from "../lib/config/type";
//general method
import { getFontSizeForLanguage } from "../lib/helpers/other";

export default function Feedback() {
  //language
  const languageContext = useContext(LanguageContext);

  const [language, setLanguage] = useState<TYPE_LANGUAGE>("en");

  useEffect(() => {
    if (!languageContext?.language) return;
    setLanguage(languageContext.language);
  }, [languageContext?.language]);

  //design
  const mediaContext = useContext(MediaContext);

  const [fontSize, setFontSize] = useState("1.6vw");

  useEffect(() => {
    if (!mediaContext) return;

    const fontSizeEn =
      mediaContext === "mobile"
        ? "4.5vw"
        : mediaContext === "tablet"
        ? "2.7vw"
        : mediaContext === "desktop"
        ? "1.6vw"
        : "1.4vw";

    setFontSize(getFontSizeForLanguage(language, fontSizeEn));
  }, [mediaContext, language]);

  return (
    <div
      style={{
        backgroundColor: "#b3f8dbff",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: `calc(${fontSize} * 1.15)`,
          letterSpacing: "0.1vw",
          wordSpacing: "0.3vw",
          color: "#0d0081ff",
          margin: "0 4%",
        }}
      >
        {language === "ja"
          ? "いつもwithCooking (ウィズ・クッキング) をご利用いただきありがとうございます🍳✨"
          : "Thank you always for using withCooking 🍳✨"}
      </h2>
      <div
        style={{
          backgroundColor: "#fffc55ff",
          height: "50%",
          width:
            mediaContext === "mobile"
              ? "90%"
              : mediaContext === "tablet"
              ? "75%"
              : "60%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: "1%/2.2%",
          fontSize,
          lineHeight:
            mediaContext === "mobile"
              ? "200%"
              : mediaContext === "tablet"
              ? "210%"
              : "300%",
          marginTop: `calc(${fontSize} * 1.5)`,
          padding: "2%",
        }}
      >
        <p>
          {language === "ja"
            ? "こちらのフォームからウェブサイトに関するご意見・ご感想をいただければとても助かります！"
            : "It will help if you could send a feedback about this website from here!"}
        </p>
        <Link
          href={
            language === "ja"
              ? "https://docs.google.com/forms/d/e/1FAIpQLScD6G3Lh1SIkn5nCCEfrj-xErbjsTjieTy5kypzNt3OCmxQPw/viewform?usp=header"
              : "https://docs.google.com/forms/d/e/1FAIpQLScJcmHthVly_ssZImDRh-AnC7cPRzKUnBtC9SgzaWRwv7HLfw/viewform?usp=header"
          }
          style={{ fontSize, letterSpacing: "0.07vw", margin: "2% 0" }}
        >
          {language === "ja" ? "ご意見・ご感想フォーム" : "Feedback form"}
        </Link>
        <p>
          {language === "ja"
            ? "今後も、よりよいウェブサイトになるよう頑張ってまいります！"
            : "I will keep tryning to make a better website!"}
        </p>
      </div>
    </div>
  );
}
