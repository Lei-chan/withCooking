"use client";
//react
import { useContext, useEffect, useState } from "react";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../lib/config/type";
//context
import { LanguageContext, MediaContext } from "../lib/providers";
//model for news
import news from "../lib/models/news";
import { getFontSizeForLanguage } from "../lib/helpers/other";

export default function News() {
  //language
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "en";

  //design
  // console.log(new Date().toISOString());
  const mediaContext = useContext(MediaContext);
  const listWidth =
    mediaContext === "mobile"
      ? "85%"
      : mediaContext === "tablet"
      ? "70%"
      : "60%";
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.3vw"
      : mediaContext === "tablet"
      ? "2.6vw"
      : mediaContext === "desktop"
      ? "1.5vw"
      : "1.3vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
  const listTitleSize = `calc(${fontSizeFinal} * 1.05)`;

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
        padding: "3% 0 5% 0",
      }}
    >
      <h1
        style={{
          fontSize: `calc(${fontSizeFinal} * 1.4)`,
          letterSpacing: "0.1vw",
          color: "#0d0081ff",
          margin: fontSizeFinal,
        }}
      >
        {language === "ja" ? "ニュース" : "News"}
      </h1>
      <div
        style={{
          backgroundColor: "#ffffffff",
          width: listWidth,
          height: "85%",
          borderRadius: "1%/1.5%",
          overflow: "hidden",
          boxShadow: "#0000005e 3px 3px 10px",
        }}
      >
        <ul
          style={{
            width: "100%",
            height: "100%",
            overflowY: "scroll",
            overflowX: "hidden",
            scrollbarColor: "#ffd000ff #fffea9ff",
          }}
        >
          {news.map((news, i) => (
            <List
              key={i}
              language={language}
              fontSize={fontSizeFinal}
              listTitleSize={listTitleSize}
              news={news}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function List({
  language,
  fontSize,
  listTitleSize,
  news,
}: {
  language: TYPE_LANGUAGE;
  fontSize: string;
  listTitleSize: string;
  news: {
    date: string;
    title: { en: string; ja: string };
    content: { en: string; ja: string };
    new: boolean;
  };
}) {
  const [userRegion, setUserRegion] = useState("en-US");

  useEffect(() => {
    setUserRegion(navigator.language);
  }, []);

  return (
    <li
      style={{
        backgroundColor: "#fffedfff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "fit-content",
        padding: "3%",
        borderBottom: "thin solid #b3f8dbff",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            width: "50%",
            height: "fit-content",
            right: "2%",
            top: "-10%",
            gap: "2%",
            alignItems: "center",
            justifyContent: "right",
          }}
        >
          {news.new && (
            <span
              style={{
                color: "#750079ff",
                textDecoration: "#750079ff underline",
                marginRight: "2%",
                fontSize: `calc(${fontSize} * 0.8)`,
                letterSpacing: "0.05vw",
                borderRadius: "50%",
              }}
            >
              New
            </span>
          )}
          <span style={{ fontSize }}>
            {new Intl.DateTimeFormat(userRegion).format(new Date(news.date))}
          </span>
        </div>
        <h4
          style={{
            fontSize: listTitleSize,
            letterSpacing: "0.1vw",
            color: "orangered",
            marginTop: listTitleSize,
          }}
        >
          {news.title[language]}
        </h4>
      </div>
      <p
        style={{
          width: "90%",
          height: "fit-content",
          fontSize,
          letterSpacing: "0.05vw",
          wordSpacing: "0.2vw",
          marginTop: "1%",
          padding: "2%",
        }}
      >
        {news.content[language]}
      </p>
    </li>
  );
}
