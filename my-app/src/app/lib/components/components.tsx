"use client";
import styles from "./component.module.css";
import React, { useContext, useState } from "react";
import clsx from "clsx";
import { MediaContext, UserContext } from "../providers";
import { redirect, RedirectType } from "next/navigation";
import Image from "next/image";
import { TYPE_MEDIA } from "../config";

export function MessageContainer({
  message,
  fontSize,
  letterSpacing,
  wordSpacing,
}: {
  message: string;
  fontSize: string;
  letterSpacing: string;
  wordSpacing: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "3% 5% 0 5%",
        textAlign: "center",
        justifyContent: "center",
        fontSize: fontSize,
        letterSpacing: letterSpacing,
        wordSpacing: wordSpacing,
        color: "rgb(190, 124, 0)",
        zIndex: "0",
      }}
    >
      <p>{message}</p>
    </div>
  );
}

export function OverlayMessage({
  option,
  content,
  toggleLogout,
}: {
  option: "message" | "question";
  content: "welcome" | "logout";
  toggleLogout?: () => void;
}) {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  const [isVisible, setIsVisible] = useState(true);

  const fontSize =
    mediaContext === "mobile"
      ? "4.4vw"
      : mediaContext === "tablet"
      ? "3vw"
      : "1.6vw";

  function getMessage() {
    let message;

    if (content === "welcome")
      message = (
        <p>
          Welcome!
          <br />
          It's nice to see you :)
          <br />
          Time to cook!
        </p>
      );

    if (content === "logout")
      message = <p>Are you sure you want to log out?</p>;

    return message;
  }

  //only for welcome message
  function handleClose() {
    setIsVisible(false);
  }

  //user log out
  function handleLogout() {
    userContext?.logout();

    redirect("/", RedirectType.replace);
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
          fontSize: fontSize,
          letterSpacing: "0.08vw",
          lineHeight: option === "message" ? "150%" : "130%",
          padding: "2%",
          color: "navy",
          borderRadius: "7px",
        }}
      >
        <button
          className={styles.btn__x}
          style={{ fontSize: fontSize }}
          onClick={() => {
            content === "welcome" && handleClose();
            content === "logout" && toggleLogout && toggleLogout();
          }}
        >
          &times;
        </button>
        {getMessage()}
        {option === "question" && (
          <button
            className={styles.btn__question}
            style={{ fontSize: `calc(${fontSize} * 0.75)` }}
            onClick={handleLogout}
          >
            I'm sure
          </button>
        )}
      </div>
    </div>
  );
}

export function PaginationButtons({
  mediaContext,
  fontSize,
  styles,
  curPage,
  numberOfPages,
  isPending,
  onClickPagination,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  styles: any;
  curPage: number;
  numberOfPages: number;
  isPending: boolean;
  onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const fontSizePagination =
    mediaContext === "mobile"
      ? fontSize
      : mediaContext === "tablet"
      ? `calc(${fontSize} * 0.9)`
      : `calc(${fontSize} * 0.8)`;
  const padding =
    mediaContext === "mobile"
      ? "1% 2%"
      : mediaContext === "tablet"
      ? "0.7% 1.2%"
      : "0.5% 1%";
  return (
    <div className={styles.container__pagination}>
      {!isPending && curPage > 1 && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
          style={{ fontSize: fontSizePagination, padding }}
          value="decrease"
          onClick={onClickPagination}
        >
          {`Page ${curPage - 1}`}
          <br />
          &larr;
        </button>
      )}
      {!isPending && numberOfPages > curPage && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
          style={{ fontSize: fontSizePagination, padding }}
          value="increase"
          onClick={onClickPagination}
        >
          {`Page ${curPage + 1}`}
          <br />
          &rarr;
        </button>
      )}
    </div>
  );
}

export function Loading({ message }: { message: string }) {
  const mediaContext = useContext(MediaContext);

  const imageSize =
    mediaContext === "mobile"
      ? 100
      : mediaContext === "tablet"
      ? 130
      : mediaContext === "desktop"
      ? 150
      : 180;

  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 174, 0, 1)",
        zIndex: "100",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "15%",
          width: "40%",
          height: "40%",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize:
              mediaContext === "mobile"
                ? "5vw"
                : mediaContext === "tablet"
                ? "2.7vw"
                : mediaContext === "desktop"
                ? "1.8vw"
                : "1.5vw",
            letterSpacing: "0.08vw",
            textAlign: "center",
          }}
        >
          {message}
        </p>
        <Image
          className={styles.img__uploading}
          src="/loading.png"
          alt="loading icon"
          width={imageSize}
          height={imageSize}
          priority
        ></Image>
      </div>
    </div>
  );
}
