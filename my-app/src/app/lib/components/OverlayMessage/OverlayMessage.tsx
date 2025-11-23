"use client";
//react
import { useContext, useState } from "react";
//context
import { UserContext } from "../../providers";
//component
import ButtonOpenAgreement from "../ButtonOpenAgreement/ButtonOpenAgreement";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";
//general methods
import {
  getData,
  getFontSizeForLanguage,
  isApiError,
  logNonApiError,
} from "../../helpers/other";

export default function OverlayMessage({
  language,
  mediaContext,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
}) {
  const userContext = useContext(UserContext);

  //design
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.4vw"
      : mediaContext === "tablet"
      ? "2.9vw"
      : "1.6vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);

  const message = (
    <>
      <p>
        {language === "ja"
          ? "プライバシーポリシーを改訂しました。まだ確認をしていない場合は、ご確認をお願いします。この情報は、ニュースページからも確認できます。"
          : "We updated our privacy policy. If you haven't checked yet, please check it out. You can also check this information on the News page."}
      </p>
      <ButtonOpenAgreement language={language} />
    </>
  );
  const [isVisible, setIsVisible] = useState(message ? true : false);

  function handleClickClose() {
    setIsVisible(false);
  }

  async function handleChangeCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      console.log(e.currentTarget.checked);
      const data = await getData("/api/users", {
        method: "PATCH",
        headers: { "Context-Type": "application/json" },
        authorization: `Bearer ${userContext?.accessToken}`,
        body: JSON.stringify({ displayMessage: !e.currentTarget.checked }),
      });

      console.log(data);
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(
          err,
          "Error while updating message display state"
        );
      console.error(
        "Error while updating message display state",
        err.message,
        err.statusCode || 500
      );
    }
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
        zIndex: "20",
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
          lineHeight: "150%",
          padding:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "3%"
              : "2%",
          color: "navy",
          borderRadius: "7px",
        }}
      >
        {message}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "3%",
            whiteSpace: "nowrap",
          }}
        >
          <input type="checkbox" onChange={handleChangeCheckbox}></input>
          <span style={{ fontSize: `calc(${fontSizeFinal} * 0.8)` }}>
            {language === "ja"
              ? "今後このメッセージを表示しない"
              : "Don't show this message again"}
          </span>
        </div>
        <button
          style={{
            backgroundImage: "linear-gradient( purple, blueviolet)",
            color: "white",
            padding: "0.5% 1%",
            marginTop: "2%",
            border: "none",
            borderRadius: "3px",
            fontSize: fontSizeFinal,
          }}
          type="button"
          onClick={handleClickClose}
        >
          {language === "ja" ? "閉じる" : "Close"}
        </button>
      </div>
    </div>
  );
}
