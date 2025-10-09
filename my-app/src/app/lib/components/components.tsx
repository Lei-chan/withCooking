"use client";
import React, { useCallback, useContext, useEffect } from "react";
import clsx from "clsx";
import styles from "./component.module.css";
import { useState } from "react";
import { AccessTokenContext } from "../providers";
import { redirect, RedirectType } from "next/navigation";

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
  const userContext = useContext(AccessTokenContext);
  const [isVisible, setIsVisible] = useState(true);

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
          width: "30%",
          height: "fit-content",
          minHeight: "30%",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(rgba(255, 235, 221, 1), rgba(255, 240, 172, 1))",
          fontSize: "1.6vw",
          letterSpacing: "0.08vw",
          lineHeight: option === "message" ? "150%" : "130%",
          padding: "2%",
          color: "navy",
          borderRadius: "7px",
        }}
      >
        <button
          className={styles.btn__x}
          onClick={() => {
            content === "welcome" && handleClose();
            content === "logout" && toggleLogout && toggleLogout();
          }}
        >
          &times;
        </button>
        {getMessage()}
        {option === "question" && (
          <button className={styles.btn__question} onClick={handleLogout}>
            I'm sure
          </button>
        )}
      </div>
    </div>
  );
}

export function PaginationButtons({
  styles,
  curPage,
  numberOfPages,
  onClickPagination,
}: {
  styles: any;
  curPage: number;
  numberOfPages: number;
  onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className={styles.container__pagination}>
      {curPage > 1 && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
          value="decrease"
          onClick={onClickPagination}
        >
          {`Page ${curPage - 1}`}
          <br />
          &larr;
        </button>
      )}
      {numberOfPages > curPage && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
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
