"use client";
import { useContext, useState } from "react";
import styles from "./page.module.css";
import { MediaContext } from "../lib/providers";
import howToUse from "../lib/models/howToUse";

export default function HowToUse() {
  const mediaContext = useContext(MediaContext);

  //design
  const fontSize = mediaContext === "mobile" ? "5vw" : "2vw";
  const fontHeaderSize = `calc(${fontSize} * 1.1)`;

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  function handleClickSearch() {
    setIsSearchVisible(!isSearchVisible);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        width: "100vw",
        minHeight: "100vh",
        maxHeight: "fit-content",
        backgroundColor: "#fff9e9ff",
        padding: "6% 0 7% 0",
      }}
    >
      <h1
        style={{
          color: "#6e6c00ff",
          letterSpacing: "0.1vw",
          fontSize: `calc(${fontSize} * 1.9)`,
          marginBottom: "4%",
        }}
      >
        How to use
      </h1>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "right",
          width: "80%",
          height: "10%",
          top: "2%",
          right: "2%",
          gap: "2%",
          overflow: "hidden",
          //   backgroundColor: "blue",
        }}
      >
        <input
          style={{
            fontSize,
            width: "75%",
            height: "fit-content",
            textAlign: "center",
            padding: "2%",
            letterSpacing: "0.1vw",
            borderRadius: "3px",
            borderColor: "#00000042",
            transform: isSearchVisible ? "translateX(0%)" : "translateX(150%)",
            transition: "all 0.4s",
          }}
          type="search"
          placeholder="search by keyword"
        ></input>
        <button
          style={{
            width: "15%",
            aspectRatio: "1",
            backgroundImage: "url('/magnifying-grass.svg')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundColor: "transparent",
            border: "none",
          }}
          onClick={handleClickSearch}
        ></button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "90%",
          height: "fit-content",
          backgroundColor: "#fffefcff",
          borderRadius: "5px",
          boxShadow: "#00000042 3px 3px 7px",
          padding: "5%",
          marginBottom: "2%",
        }}
      >
        {howToUse.map((section, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h4
              className={styles.small_header}
              style={{ fontSize: fontHeaderSize }}
            >
              {section.header}
            </h4>
            <div className={styles.container__a} style={{ fontSize }}>
              {section.contents.map((content, i) => (
                <a key={i} className={styles.a} href="">
                  {content.title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 5%" }}>
        {howToUse.map((section, i) => (
          <div key={i} style={{ margin: "10% 0" }}>
            <h3 className={styles.small_header}>{section.header}</h3>
            {section.contents.map((content, i) => (
              <div key={i}>
                <p
                  style={{
                    fontSize: fontHeaderSize,
                    color: "rgb(0, 103, 187)",
                    margin: "5% 0",
                  }}
                >
                  {content.title}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
