"use client";
import { useContext } from "react";
import { MediaContext } from "../lib/providers";
import news from "../lib/models/news";
import { TYPE_MEDIA } from "../lib/config";

export default function News() {
  const mediaContext = useContext(MediaContext);
  console.log(mediaContext);
  // console.log(new Date().toISOString());

  const listWidth =
    mediaContext === "mobile"
      ? "85%"
      : mediaContext === "tablet"
      ? "70%"
      : "60%";
  const fontSize =
    mediaContext === "mobile"
      ? "4.3vw"
      : mediaContext === "tablet"
      ? "2.8vw"
      : mediaContext === "desktop"
      ? "1.7vw"
      : "1.4vw";
  const listTitleSize = `calc(${fontSize} * 1.05)`;

  return (
    <div
      style={{
        backgroundColor: "#b3f8dbff",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          fontSize: `calc(${fontSize} * 1.4)`,
          letterSpacing: "0.1vw",
          color: "#0d0081ff",
          margin: fontSize,
        }}
      >
        News
      </h1>
      <div
        style={{
          backgroundColor: "#ffffffff",
          width: listWidth,
          height: "75%",
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
              mediaContext={mediaContext}
              fontSize={fontSize}
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
  mediaContext,
  fontSize,
  listTitleSize,
  news,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  listTitleSize: string;
  news: { date: string; title: string; content: string; new: boolean };
}) {
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
                // color: "orange",
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
            {Intl.DateTimeFormat(navigator.language).format(
              new Date(news.date)
            )}
          </span>
        </div>
        <h4
          style={{
            fontSize: listTitleSize,
            letterSpacing: "0.1vw",
            color: "orangered",
            // textDecoration: "orangered underline",
            marginTop: listTitleSize,
          }}
        >
          {news.title}
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
          // textOverflow: "clip",
          // backgroundColor: "blue",
        }}
      >
        {news.content}
      </p>
    </li>
  );
}
