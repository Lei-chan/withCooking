"use client";
//react
import { useContext, useState } from "react";
//next.js
import { useRouter } from "next/navigation";
//css
import styles from "./overlayMessage.module.css";
//context
import { UserContext } from "../../providers";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";
//general method
import { getFontSizeForLanguage } from "../../helpers/other";

export default function OverlayMessage({
  language,
  mediaContext,
  option,
  content,
  toggleLogout,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  option: "message" | "question";
  content: "welcome" | "logout" | "close";
  toggleLogout?: () => void;
}) {
  const router = useRouter();
  const userContext = useContext(UserContext);

  //design
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.4vw"
      : mediaContext === "tablet"
      ? "3vw"
      : "1.6vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);

  const [isVisible, setIsVisible] = useState(true);

  function getMessage() {
    let message;

    if (content === "welcome")
      message = (
        <p>
          {language === "ja" ? "こんにちは！" : "Welcome!"}
          <br />
          {language === "ja"
            ? "今日もお会いできて嬉しいです！"
            : "It's nice to see you :)"}
          <br />
          {language === "ja"
            ? "さあ、クッキングを始めましょう！"
            : "Let's start cooking!"}
        </p>
      );

    if (content === "logout")
      message = (
        <p>
          {language === "ja"
            ? "ログアウトしてよろしいですか？"
            : "Are you sure you want to log out?"}
        </p>
      );

    if (content === "close")
      message = (
        <p>
          {language === "ja"
            ? "これまでご利用いただきありがとうございました！また会えるのを楽しみにしています！"
            : "Thank you for using this app :) I hope to see you again!"}
        </p>
      );

    return message;
  }

  //for welcome message
  function handleClose() {
    setIsVisible(false);
  }

  //user log out
  function handleLogout() {
    userContext?.logout();

    router.push("/");
  }

  return (
    <div
      style={{
        position: "fixed",
        display: isVisible ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.37)",
        backdropFilter: "blur(3px)",
        zIndex: "100",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width:
            mediaContext === "mobile"
              ? "85%"
              : mediaContext === "tablet"
              ? "67%"
              : "30%",
          height: "fit-content",
          minHeight: "30%",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(rgba(255, 235, 221, 1), rgba(255, 240, 172, 1))",
          fontSize: fontSizeFinal,
          letterSpacing: "0.08vw",
          lineHeight: option === "message" ? "150%" : "130%",
          padding: "2%",
          color: "navy",
          borderRadius: "7px",
        }}
      >
        {content !== "close" && (
          <button
            className={styles.btn__x}
            style={{ fontSize: `calc(${fontSizeFinal} * 1.5)` }}
            onClick={() => {
              content === "welcome" && handleClose();
              content === "logout" && toggleLogout && toggleLogout();
            }}
          >
            &times;
          </button>
        )}
        {getMessage()}
        {option === "question" && (
          <button
            className={styles.btn__question}
            style={{ fontSize: fontSizeFinal }}
            onClick={handleLogout}
          >
            {language === "ja" ? "はい" : "I'm Sure"}
          </button>
        )}
      </div>
    </div>
  );
}
