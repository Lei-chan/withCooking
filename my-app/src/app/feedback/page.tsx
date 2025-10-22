"use client";
import Link from "next/link";
import { useContext } from "react";
import { MediaContext } from "../lib/providers";

export default function Feedback() {
  const mediaContext = useContext(MediaContext);

  const boxWidth =
    mediaContext === "mobile"
      ? "90%"
      : mediaContext === "tablet"
      ? "75%"
      : "60%";
  const fontSize =
    mediaContext === "mobile"
      ? "4.5vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : mediaContext === "desktop"
      ? "1.6vw"
      : "1.4vw";

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
      <h2
        style={{
          fontSize: `calc(${fontSize} * 1.15)`,
          letterSpacing: "0.1vw",
          wordSpacing: "0.3vw",
          color: "#0d0081ff",
          margin: "0 4%",
        }}
      >
        Thank you always for using withCooking 🍳✨
      </h2>
      <div
        style={{
          backgroundColor: "#fffc55ff",
          height: "50%",
          width: boxWidth,
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
          It will help if you could send a feedback about this website from
          here!
        </p>
        <Link
          href={""} //later!
          style={{ fontSize, letterSpacing: "0.07vw", margin: "2% 0" }}
        >
          Feedback from here
        </Link>
        <p>I will keep tryning to make a better website!</p>
      </div>
    </div>
  );
}
