//css
import styles from "./agreement.module.css";
//type
import { TYPE_LANGUAGE } from "../../config/type";
import { useContext } from "react";
import { MediaContext } from "../../providers";

export default function Agreement({
  language,
  onClickOutsideAgreement,
}: {
  language: TYPE_LANGUAGE;
  onClickOutsideAgreement: () => void;
}) {
  const mediaContext = useContext(MediaContext);

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        top: "0",
        left: "0",
        backgroundColor: "rgba(0, 0, 0, 0.384)",
        backdropFilter: "blur(3px)",
        zIndex: "50",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClickOutsideAgreement}
    >
      <div
        style={{
          width:
            mediaContext === "mobile"
              ? "90%"
              : mediaContext === "tablet"
              ? "70%"
              : "50%",
          height: "80%",
          backgroundColor: "rgba(255, 252, 229, 1)",
          textAlign: "left",
          padding: "5%",
          overflowY: "scroll",
          borderRadius: "5px",
        }}
      >
        <h2>{language === "ja" ? "プライバシーポリシー" : "Privacy Policy"}</h2>
        <h3 className={styles.small_header}>
          {language === "ja" ? "クッキー" : "Cookies"}
        </h3>
        <p className={styles.use_for_below}>
          {language === "ja"
            ? "このサイトは以下のためにクッキーを利用します"
            : "This site uses cookies to:"}
        </p>
        <p>
          •{" "}
          {language === "ja"
            ? "安全なセッション管理と認証に必要なリフレッシュトークンを保管するため"
            : "Store your refresh token for secure session management and authentication"}
          <br />•{" "}
          {language === "ja"
            ? "閲覧できるセッションをまたいでのログイン状態を維持します"
            : "Keep you logged in across browsing sessions"}
          <br />
          {language === "ja"
            ? "以上のクッキーの使用は、私たちがサービスを提供するのに必要なものです。"
            : "These cookies are essential for the functionality of our service."}
        </p>
        <h3 className={styles.small_header}>
          {language === "ja" ? "ローカルストレージ" : "Local Storage"}
        </h3>
        <p className={styles.use_for_below}>
          {language === "ja"
            ? "このサイトは以下のためにブラウザーのローカルストレージを使用します"
            : "This site uses browser local storage to:"}
        </p>
        <p>
          •{" "}
          {language === "ja"
            ? "ユーザーの使用する言語を覚えておくため"
            : "Remember your preferred language setting"}
          <br />•{" "}
          {language === "ja"
            ? "迅速なアクセスに必要な、ユーザーのレシピの数を保管するため"
            : "Store the number of recipes in your collection for quick access"}
          <br />•{" "}
          {language === "ja"
            ? "これらの情報は私たちのサーバーに送ることなく個人に合ったウェブサイトを提供するためのみに使用します"
            : "Provide personalized experience without sending this data to our servers"}
        </p>
        <p style={{ marginTop: "15%" }}>
          {language === "ja"
            ? "これらの情報はユーザーのデバイスにのみ保管されるものであり、ユーザーはブラウザー設定でいつでも情報を消去することができます。"
            : "This data is only stored in your device and can be cleared at any time through your browser settings."}
        </p>
      </div>
    </div>
  );
}
