"use client";
//react
import { useContext, useState } from "react";
//component
import Agreement from "../Agreement/Agreement";
//type
import { TYPE_LANGUAGE } from "../../config/type";
import { MediaContext } from "../../providers";
import { getFontSizeForLanguage } from "../../helpers/other";

export default function ButtonOpenAgreement({
  language,
}: {
  language: TYPE_LANGUAGE;
}) {
  //design
  const mediaContext = useContext(MediaContext);

  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.3vw"
      : mediaContext === "tablet"
      ? "2.6vw"
      : mediaContext === "desktop"
      ? "1.5vw"
      : "1.3vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);

  const [isAgreementVisible, setIsAgreementVisible] = useState(false);

  function handleToggleAgreement() {
    setIsAgreementVisible(!isAgreementVisible);
  }

  return (
    <div style={{ pointerEvents: "all" }}>
      <button
        style={{
          background: "none",
          color: "blueviolet",
          border: "none",
          fontSize: fontSizeFinal,
        }}
        type="button"
        onClick={handleToggleAgreement}
      >
        {language === "ja" ? "プライバシーポリシー" : "Privacy Policy"}
      </button>
      {isAgreementVisible && (
        <Agreement
          language={language}
          onClickOutsideAgreement={handleToggleAgreement}
        />
      )}
    </div>
  );
}
