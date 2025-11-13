"use client";
//react
import { useEffect, useState, useContext, useMemo } from "react";
import { useInView } from "react-intersection-observer";
//next.js
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
//css
import styles from "./page.module.css";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "./lib/config/type";
//settings
import { PASSWORD_MIN_EACH, PASSWORD_MIN_LENGTH } from "./lib/config/settings";
//general methods
import { getData, getFontSizeForLanguage } from "@/app/lib/helpers/other";
//context
import { UserContext, MediaContext, LanguageContext } from "./lib/providers";
//model
import homeDetails from "./lib/models/homeDetails";
//component
import { LanguageSelect } from "./lib/components/components";

export default function Home() {
  //language
  const languageContext = useContext(LanguageContext);

  const [language, setLanguage] = useState<TYPE_LANGUAGE>("en");

  useEffect(() => {
    if (!languageContext?.language) return;
    setLanguage(languageContext.language);
  }, [languageContext?.language]);

  //design
  const mediaContext = useContext(MediaContext);
  const [fontSize, setFontSize] = useState("1.6vw");
  const [headerSize, setHeaderSize] = useState(`calc(${fontSize} * 1.5)`);
  const [warningFontSize, setWarningFontSize] = useState(
    `calc(${fontSize} * 1.1)`
  );
  const [inputWrapperWidth, setInputWrapperWidth] = useState("65%");
  const [btnXDesign, setBtnXDesign] = useState({
    top: "-2%",
    fontSize: "2.5vw",
  });
  const [eyeOnWidth, setEyeOnWidth] = useState("9.3%");
  const [eyeOffWidth, setEyeOffWidth] = useState(`calc(${eyeOnWidth} - 1%)`);

  useEffect(() => {
    if (!mediaContext) return;

    const fontSizeEn =
      mediaContext === "mobile"
        ? "4vw"
        : mediaContext === "tablet"
        ? "2.5vw"
        : mediaContext === "desktop"
        ? "1.8vw"
        : "1.5vw";
    const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
    setFontSize(fontSizeFinal);

    setHeaderSize(`calc(${fontSizeFinal} * 1.5)`);

    setWarningFontSize(`calc(${fontSizeFinal} * 1.1)`);

    setBtnXDesign({
      top: "-2%",
      fontSize: `calc(${fontSizeEn} * 1.9)`,
    });
  }, [mediaContext, language]);

  useEffect(() => {
    if (!mediaContext) return;

    setInputWrapperWidth(
      mediaContext === "mobile"
        ? "72%"
        : mediaContext === "tablet"
        ? "68%"
        : "65%"
    );

    const eyeOnWid =
      mediaContext === "mobile"
        ? "12%"
        : mediaContext === "tablet"
        ? "10%"
        : mediaContext === "desktop"
        ? "9.3%"
        : "9%";
    setEyeOnWidth(eyeOnWid);
    setEyeOffWidth(`calc(${eyeOnWid} - 1%)`);
  }, [mediaContext]);

  //userContext
  const userContext = useContext(UserContext);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleToggleLogin = function () {
    setShowLogin(!showLogin);
  };

  const handleToggleSignup = function () {
    setShowSignup(!showSignup);
  };

  //Add escape key event listener
  useEffect(() => {
    const handleKeyDownEscape = function (e: any) {
      if (e.key !== "Escape" || (!showLogin && !showSignup)) return;

      showLogin ? handleToggleLogin() : handleToggleSignup();
    };

    window.addEventListener("keydown", handleKeyDownEscape);

    return () => {
      window.removeEventListener("keydown", handleKeyDownEscape);
    };
  }, [showLogin, showSignup]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        // height: "fit-content",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        zIndex: "auto",
      }}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <LanguageSelect
          mediaContext={mediaContext}
          fontSize={fontSize}
          position="absolute"
          minWidth={mediaContext === "mobile" ? "35%" : "10%"}
          backgroundColor="white"
          color="black"
        />
        <Buttons
          mediaContext={mediaContext}
          language={languageContext?.language || "en"}
          fontSize={fontSize}
          onLoginClick={handleToggleLogin}
          onSignupClick={handleToggleSignup}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            width: "80%",
            height: "90%",
            letterSpacing: "0.05vw",
          }}
        >
          <Image
            src="/home/withCooking-title.gif"
            alt="withCooking"
            width={
              mediaContext === "mobile"
                ? 300
                : mediaContext === "tablet"
                ? 450
                : mediaContext === "desktop"
                ? 600
                : 900
            }
            height={
              mediaContext === "mobile"
                ? 100
                : mediaContext === "tablet"
                ? 150
                : mediaContext === "desktop"
                ? 180
                : 250
            }
            priority
            unoptimized
          ></Image>
          <p
            className={styles.description}
            style={{
              width: "100%",
              lineHeight: "150%",
              fontSize,
            }}
          >
            {languageContext?.language === "ja"
              ? "このウェブサイトには、クッキングの時に「こんなものがあったらよかったのにな～」といったものが詰まっています！"
              : 'In this app, these kinds of features which you think "that would be nice if there were..." for cooking are stuffed!'}
            <br />
            {languageContext?.language === "ja"
              ? "複数のタイマーをセットして料理ができたり、メモができたり、簡単に自分が作ったレシピをタイトルや材料で検索出来たり、料理の時によく使われる単位を変換できたり、自分がつっくたレシピを整理された形で保管できたり…。"
              : "Cook with a recipe using multiple timers or memo, easily search your recipe by title or ingredient, convert units frequently used for cook, manage your recipes, etc."}
            <br />
            {languageContext?.language === "ja"
              ? "この、シンプルだけれどとても便利なウェブサイトが、あなたのクッキング仲間となるでしょう！"
              : "This simple but userful app will become your cooking buddy :)"}
          </p>
        </div>
        <div
          style={{
            width: "100%",
            height: "fit-content",
            padding: "2%",
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.185))",
            color: " #ff8800ff",
            letterSpacing: "0.05vw",
            fontSize,
          }}
        >
          <p>
            {languageContext?.language === "ja"
              ? "詳細はスクロールしてチェック"
              : "Scroll for more details"}
          </p>
          <p>&darr;</p>
        </div>
      </div>
      <BottomHalf
        mediaContext={mediaContext}
        language={languageContext?.language || "en"}
        fontSize={fontSize}
      />
      <OverlayLogin
        mediaContext={mediaContext}
        language={languageContext?.language || "en"}
        userContext={userContext}
        fontSize={fontSize}
        warningFontSize={warningFontSize}
        inputWrapperWidth={inputWrapperWidth}
        btnXDesign={btnXDesign}
        headerSize={headerSize}
        eyeOnWidth={eyeOnWidth}
        eyeOffWidth={eyeOffWidth}
        show={showLogin ? true : false}
        onClickX={handleToggleLogin}
        onClickOutside={handleToggleLogin}
      />
      <OverlayCreateAccount
        mediaContext={mediaContext}
        language={languageContext?.language || "en"}
        userContext={userContext}
        fontSize={fontSize}
        warningFontSize={warningFontSize}
        inputWrapperWidth={inputWrapperWidth}
        btnXDesign={btnXDesign}
        headerSize={headerSize}
        eyeOnWidth={eyeOnWidth}
        eyeOffWidth={eyeOffWidth}
        show={showSignup ? true : false}
        onClickX={handleToggleSignup}
        onClickOutside={handleToggleSignup}
      />
    </div>
  );
}

function Buttons({
  mediaContext,
  language,
  fontSize,
  onLoginClick,
  onSignupClick,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
}) {
  const btnFontSize = `calc(${fontSize} * 1.2)`;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        right: "0%",
        width:
          mediaContext === "mobile"
            ? "45%"
            : mediaContext === "tablet"
            ? "30%"
            : mediaContext === "desktop"
            ? "25%"
            : "20%",
        aspectRatio: "1 / 0.25",
      }}
    >
      <button
        className={styles.btn__login}
        style={{
          fontSize: btnFontSize,
        }}
        onClick={onLoginClick}
      >
        {language === "en" ? "Login" : "ログイン"}
      </button>
      <button
        className={styles.btn__signup}
        style={{
          fontSize: btnFontSize,
        }}
        onClick={onSignupClick}
      >
        {language === "en" ? "Sign up" : "登録"}
      </button>
    </div>
  );
}

function BottomHalf({
  mediaContext,
  language,
  fontSize,
}: {
  mediaContext: string;
  language: TYPE_LANGUAGE;
  fontSize: string;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.02,
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Details
        mediaContext={mediaContext}
        language={language}
        fontSize={fontSize}
      />
      <h3
        ref={ref}
        style={{
          letterSpacing: "0.15vw",
          wordSpacing: "0.3vw",
          fontStyle: "italic",
          margin: "8%",
          borderBottom: "thin solid red",
          width: "fit-content",
          transition: "all 1.5s",
          fontSize:
            mediaContext === "mobile"
              ? "6vw"
              : mediaContext === "tablet"
              ? "4vw"
              : "2.8vw",
          opacity: inView ? "1" : "0",
          transform: inView ? "scale(100%)" : "scale(90%)",
        }}
      >
        {language === "ja" ? "さあ、" : "Let's start "}
        <span className={styles.span__withcooking}>withCooking</span>{" "}
        {language === "ja" ? "と" : "by "}
        {(mediaContext === "mobile" || mediaContext === "tablet") && <br />}
        {language === "ja"
          ? "クッキングを楽しみましょう！"
          : "signing up for free"}
      </h3>
      <footer
        style={{
          width: "100vw",
          padding:
            mediaContext === "mobile"
              ? "3% 0 1% 0"
              : mediaContext === "tablet"
              ? "2.5% 0 1% 0"
              : "1.6% 0",
          aspectRatio: "1 / 0.11",
          backgroundImage: "linear-gradient(rgb(255, 208, 0), orange)",
        }}
      >
        <Link
          className={styles.link__footer}
          href="https://www.instagram.com/leichanweb?igsh=NzJmb3Axc3ZvNWN6&utm_source=qr"
        >
          <button
            className={styles.link__button}
            style={{
              backgroundImage: 'url("/icons/instagram.png")',
              marginRight:
                mediaContext === "mobile"
                  ? "4%"
                  : mediaContext === "tablet"
                  ? "3%"
                  : "2%",
              width:
                mediaContext === "mobile"
                  ? "8%"
                  : mediaContext === "tablet"
                  ? "7%"
                  : "4%",
            }}
          ></button>
        </Link>
        <Link
          className={styles.link__footer}
          href="https://github.com/Lei-chan"
        >
          <button
            className={styles.link__button}
            style={{
              backgroundImage: 'url("/icons/github.svg")',
              marginRight:
                mediaContext === "mobile"
                  ? "3.5%"
                  : mediaContext === "tablet"
                  ? "2.7%"
                  : "1.7%",
              width:
                mediaContext === "mobile"
                  ? "8%"
                  : mediaContext === "tablet"
                  ? "7%"
                  : "4%",
            }}
          ></button>
        </Link>
        <Link
          className={styles.link__footer}
          href={
            language === "ja"
              ? "https://docs.google.com/forms/d/e/1FAIpQLScD6G3Lh1SIkn5nCCEfrj-xErbjsTjieTy5kypzNt3OCmxQPw/viewform?usp=header"
              : "https://docs.google.com/forms/d/e/1FAIpQLScJcmHthVly_ssZImDRh-AnC7cPRzKUnBtC9SgzaWRwv7HLfw/viewform?usp=header"
          }
        >
          <button
            className={styles.link__button}
            style={{
              backgroundImage: 'url("/icons/feedback.png")',
              width:
                mediaContext === "mobile"
                  ? "7%"
                  : mediaContext === "tablet"
                  ? "7%"
                  : mediaContext === "desktop"
                  ? "4%"
                  : "4%",
            }}
          ></button>
        </Link>
        <p
          style={{
            color: "rgb(55, 0, 107)",
            letterSpacing: "0.05vw",
            marginTop: "0.8%",
            fontSize:
              mediaContext === "mobile"
                ? "3.5vw"
                : mediaContext === "tablet"
                ? "2.5vw"
                : "1.5vw",
          }}
        >
          Designed by Freepik
        </p>
        <p
          style={{
            color: "rgb(127, 0, 247)",
            letterSpacing: "0.05vw",
            wordSpacing: "0.2vw",
            fontSize:
              mediaContext === "mobile"
                ? "3.5vw"
                : mediaContext === "tablet"
                ? "2.5vw"
                : "1.5vw",
          }}
        >
          © 2025 Lei-chan
        </p>
      </footer>
    </div>
  );
}

function Details({
  mediaContext,
  language,
  fontSize,
}: {
  mediaContext: string;
  language: TYPE_LANGUAGE;
  fontSize: string;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.02,
  });

  return (
    <div style={{ width: "100%", height: "fit-content", overflow: "hidden" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          marginTop:
            mediaContext === "mobile"
              ? "25%"
              : mediaContext === "tablet"
              ? "16%"
              : mediaContext === "desktop"
              ? "13%"
              : "10%",
          padding:
            mediaContext === "mobile"
              ? "7% 0 20% 0"
              : mediaContext === "tablet"
              ? "6% 0"
              : "4% 0",
          backgroundImage: "linear-gradient(#ffffee, #fff5d6 8%, #feffc4)",
        }}
      >
        <h1
          ref={ref}
          style={{
            position: "absolute",
            top: mediaContext === "mobile" ? "-2%" : "-1%",
            left:
              mediaContext === "mobile"
                ? "5%"
                : mediaContext === "tablet"
                ? "3%"
                : "2%",
            backgroundImage:
              "linear-gradient(150deg, rgb(255, 230, 0) 10%, rgb(255, 102, 0))",
            width: "fit-content",
            height: "fit-content",
            letterSpacing: "0.15vw",
            wordSpacing: "0.3vw",
            lineHeight: "130%",
            padding: "2% 3.5%",
            color: "rgb(119, 87, 0)",
            transition: "all 1s",
            boxShadow: "rgba(0, 0, 0, 0.301) 3px 3px 8px",
            transform: !inView
              ? "translateX(-98%) skewX(-17deg)"
              : "translateX(0%) skewX(-17deg)",
            fontSize: `calc(${fontSize} * 1.5)`,
          }}
        >
          {language === "ja"
            ? "あなたのお気に入りのレシピを１つのサイトに"
            : "Manage your favorite recipes "}
          {mediaContext === "mobile" && <br />}
          {language === "ja" ? "まとめましょう" : "in one app"}
        </h1>
        {homeDetails.map((detail, i) => (
          <Explanation
            key={i}
            mediaContext={mediaContext}
            language={language}
            fontSize={fontSize}
            detail={detail}
            i={i}
          />
        ))}
      </div>
    </div>
  );
}

function Explanation({
  mediaContext,
  language,
  fontSize,
  detail,
  i,
}: {
  mediaContext: string;
  language: TYPE_LANGUAGE;
  fontSize: string;
  detail: {
    title: { en: string; ja: string };
    image: string;
    explanation: { en: string; ja: string };
    heightRatio: number;
  };
  i: number;
}) {
  //design
  const imageWidth =
    mediaContext === "mobile"
      ? 250
      : mediaContext === "tablet"
      ? 360
      : mediaContext === "desktop"
      ? 400
      : 450;
  const imageHeight = imageWidth * detail.heightRatio;
  const marginTopDefault =
    mediaContext === "mobile"
      ? "15%"
      : mediaContext === "tablet"
      ? "10%"
      : "7%";
  const TITLE_TOO_LONG =
    mediaContext === "mobile" ? 25 : mediaContext === "tablet" ? 35 : 45;
  const isTitleLong = useMemo(
    () => detail.title[language].length >= TITLE_TOO_LONG,
    [detail]
  );

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.02 });
  const [transform, setTransform] = useState("");

  const isEven = useMemo(() => (i % 2 === 0 ? true : false), [detail]);

  useEffect(() => {
    const nextTransform = getTransform(inView, isEven);
    setTransform(nextTransform);
  }, [inView, isEven]);

  function getTransform(inView: any, isEven: boolean) {
    if (!inView && isEven) return "translateX(98%)";
    if (!inView && !isEven) return "translateX(-98%)";
    if (inView && isEven) {
      return mediaContext === "mobile"
        ? "translateX(0%)"
        : mediaContext === "tablet"
        ? "translateX(3%)"
        : mediaContext === "desktop"
        ? "translateX(8%)"
        : "translateX(15%)";
    }

    if (inView && !isEven) {
      return mediaContext === "mobile"
        ? "translateX(0%)"
        : mediaContext === "tablet"
        ? "translateX(-3%)"
        : mediaContext === "desktop"
        ? "translateX(-8%)"
        : "translateX(-15%)";
    }

    return "";
  }

  console.log(mediaContext);
  ///even number details appear from right, odd number from left
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width:
          mediaContext === "mobile"
            ? "94%"
            : mediaContext === "tablet"
            ? "85%"
            : mediaContext === "desktop"
            ? "75%"
            : "65%",
        height: "fit-content",
        display: "flex",
        flexDirection:
          mediaContext === "mobile" || mediaContext === "tablet"
            ? "column"
            : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "5%",
        marginTop: !isTitleLong
          ? marginTopDefault
          : `calc(${marginTopDefault} * 1.3)`,
        padding:
          mediaContext === "mobile"
            ? "8% 2%"
            : mediaContext === "tablet"
            ? "8% 4%"
            : mediaContext === "desktop"
            ? "8% 2%"
            : "4%",
        backgroundColor: "#fffbe6",
        textAlign: "left",
        borderRadius: "1% / 2.3%",
        boxShadow: "rgba(0, 0, 0, 0.301) 5px 5px 10px",
        transition: "all 1s",
        transform: transform,
      }}
    >
      <h2
        style={{
          position: "absolute",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(150deg,rgb(198, 233, 1) 5%,rgb(129, 199, 0))",
          width: "fit-content",
          height: "fit-content",
          letterSpacing: "0.15vw",
          padding: "0.6% 3%",
          margin: "0 0 0 5%",
          transform: "skewX(-17deg)",
          color: "aliceblue",
          whiteSpace: isTitleLong ? "inherit" : "nowrap",
          top: isTitleLong ? "-9vh" : "-4vh",
          right:
            mediaContext === "mobile"
              ? "2%"
              : mediaContext === "tablet"
              ? "2%"
              : mediaContext === "desktop"
              ? "2%"
              : "2%",
          fontSize:
            mediaContext === "mobile"
              ? "6vw"
              : mediaContext === "tablet"
              ? "3.9vw"
              : mediaContext === "desktop"
              ? "3vw"
              : "2.6vw",
        }}
      >
        {detail.title[language]}
      </h2>
      <div
        style={{
          position: "relative",
          width:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "100%"
              : "fit-content",
          height:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "fit-content"
              : "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={detail.image}
          alt={`${detail.title[language]} image`}
          width={imageWidth}
          height={imageHeight}
        ></Image>
      </div>
      <p
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "left",
          alignItems: "center",
          width:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "100%"
              : "43%",
          height: "fit-content",
          fontSize,
          letterSpacing: "0.06vw",
          lineHeight: "140%",
          padding: "4% 4% 0 4%",
        }}
      >
        {detail.explanation[language]}
      </p>
    </div>
  );
}
function OverlayLogin({
  mediaContext,
  language,
  userContext,
  fontSize,
  warningFontSize,
  inputWrapperWidth,
  btnXDesign,
  headerSize,
  eyeOnWidth,
  eyeOffWidth,
  show,
  onClickX,
  onClickOutside,
}: {
  mediaContext: string;
  language: TYPE_LANGUAGE;
  userContext: any;
  fontSize: string;
  warningFontSize: string;
  inputWrapperWidth: string;
  btnXDesign: object;
  headerSize: string;
  eyeOnWidth: string;
  eyeOffWidth: string;
  show: Boolean;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
  const router = useRouter();

  //design
  const [formWidth, setFormWidth] = useState("35%");

  useEffect(() => {
    setFormWidth(
      mediaContext === "mobile"
        ? "85%"
        : mediaContext === "tablet"
        ? "50%"
        : mediaContext === "desktop"
        ? "35%"
        : "30%"
    );
  }, [mediaContext]);

  const [isPasswordVisible, setPasswordIsVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();
  const [errorFields, setErrorFields] = useState<
    "email" | "password" | "both" | ""
  >("");

  const handleTogglePassword = function () {
    setPasswordIsVisible(!isPasswordVisible);
  };

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      setError("");
      setErrorFields("");
      setIsPending(true);

      const [[email, emailValue], [password, passwordValue]] = [
        ...new FormData(e.currentTarget),
      ];

      const trimmedEmail = emailValue.toString().trim();
      const trimmedPassword = passwordValue.toString().trim();

      if (!trimmedEmail && !trimmedPassword) {
        setErrorFields("both");
        return setError(
          language === "ja"
            ? "※両方入力してください"
            : "※Please fill both fields"
        );
      }

      //send data to server
      await login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      //go to main
      router.push("/main");
    } catch (err: any) {
      setError(
        `${
          language === "ja"
            ? "ログイン中にエラーが発生しました"
            : "Server error while loging in"
        } ${err.message}`
      );
      err.message.includes("password") && setErrorFields("password");
      err.message.includes("email") && setErrorFields("email");

      return console.error(
        "Error while loging in",
        err.message,
        err.statusCode || 500
      );
    }
  };

  async function login(accountInfo: { email: string; password: string }) {
    try {
      const data = await getData("/api/users?create=false", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountInfo),
      });

      userContext?.firstLogin(data.accessToken, data.data.numberOfRecipes);
    } catch (err) {
      throw err;
    }
  }

  return (
    <div
      className={styles.overlay__login}
      style={{
        opacity: !show ? "0" : "1",
        pointerEvents: !show ? "none" : "all",
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (e.currentTarget === target) onClickOutside();
      }}
    >
      <p
        className={styles.warning}
        style={{
          width: formWidth,
          backgroundColor: error ? "orangered" : "rgba(255, 160, 16, 1)",
          display: !error && !isPending ? "none" : "block",
          fontSize: warningFontSize,
        }}
      >
        {error
          ? error
          : `${language === "ja" ? "ログイン中…" : "Loging in..."}`}
      </p>
      <form
        className={styles.form}
        style={{
          position: "relative",
          width: formWidth,
          backgroundImage: "linear-gradient(rgb(255, 217, 0), orange)",
          aspectRatio: "1 / 0.61",
          borderRadius: "2% / calc(2% + 2% * 0.6)",
          padding: "1.6% 0",
        }}
        onSubmit={handleSubmit}
      >
        <button
          className={styles.btn__x}
          style={btnXDesign}
          type="button"
          onClick={onClickX}
        >
          &times;
        </button>
        <h2
          className={styles.h2}
          style={{
            fontSize: headerSize,
            paddingTop: mediaContext === "mobile" ? "2%" : "0",
          }}
        >
          {language === "ja" ? "ログイン" : "Login"}
        </h2>
        <div
          className={styles.input_wrapper}
          style={{ width: inputWrapperWidth }}
        >
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "email" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize,
            }}
            name="email"
            type="email"
            placeholder={language === "ja" ? "メールアドレス" : "email"}
          />
        </div>
        <div
          className={styles.input_wrapper}
          style={{ width: inputWrapperWidth }}
        >
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "password" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize,
            }}
            type={!isPasswordVisible ? "password" : "text"}
            name="password"
            placeholder={language === "ja" ? "パスワード" : "password"}
          />
          <button
            className={styles.btn__eye}
            style={{
              width: eyeOffWidth,
              opacity: isPasswordVisible ? "0" : "1",
            }}
            type="button"
            onClick={handleTogglePassword}
          ></button>
          <button
            className={styles.btn__eye_off}
            style={{
              width: eyeOnWidth,
              opacity: !isPasswordVisible ? "0" : "1",
            }}
            type="button"
            onClick={handleTogglePassword}
          ></button>
        </div>
        <button
          className={styles.btn__submit_login}
          style={{ fontSize }}
          type="submit"
        >
          {language === "ja" ? "ログイン" : "Log in"}
        </button>
      </form>
    </div>
  );
}

function OverlayCreateAccount({
  mediaContext,
  language,
  userContext,
  fontSize,
  warningFontSize,
  inputWrapperWidth,
  btnXDesign,
  headerSize,
  eyeOnWidth,
  eyeOffWidth,
  show,
  onClickX,
  onClickOutside,
}: {
  mediaContext: string;
  language: TYPE_LANGUAGE;
  userContext: any;
  fontSize: string;
  warningFontSize: string;
  inputWrapperWidth: string;
  btnXDesign: object;
  headerSize: string;
  eyeOnWidth: string;
  eyeOffWidth: string;
  show: Boolean;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
  const router = useRouter();

  //design
  const [formWidth, setFormWidth] = useState("39%");
  const [h4Design, setH4Design] = useState({
    fontSize: "1.55vw",
    letterSpacing: "0.08vw",
  });

  useEffect(() => {
    if (!mediaContext) return;

    setFormWidth(
      mediaContext === "mobile"
        ? "80%"
        : mediaContext === "tablet"
        ? "50%"
        : "39%"
    );
    setH4Design({
      fontSize:
        mediaContext === "mobile"
          ? "4.5vw"
          : mediaContext === "tablet"
          ? "2.7vw"
          : mediaContext === "desktop"
          ? "1.55vw"
          : "1.5vw",
      letterSpacing: "0.08vw",
    });
  }, [mediaContext]);

  const [isPasswordVisible, setPasswordIsVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [errorFields, setErrorFields] = useState<
    "email" | "password" | "both"
  >();

  const handleTogglePassword = function () {
    setPasswordIsVisible(!isPasswordVisible);
  };

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      setError("");
      setIsPending(true);

      const [[email, emailValue], [password, passwordValue]] = [
        ...new FormData(e.currentTarget),
      ];

      const trimmedEmail = emailValue.toString().trim();
      const trimmedPassword = passwordValue.toString().trim();

      if (!trimmedEmail && !trimmedPassword) {
        setErrorFields("both");
        return setError(
          language === "ja"
            ? "※両方入力してください"
            : "※Please fill both fields"
        );
      }

      await createAccount({ email: trimmedEmail, password: trimmedPassword });

      router.push("/main");
    } catch (err: any) {
      setError(
        `${
          language === "ja"
            ? "アカウントの作成中にエラーが発生しました"
            : "Server error while creating account"
        } ${err.message}`
      );
      setErrorFields(err.message.includes("email") ? "email" : "password");

      console.error(
        "error while creating account",
        err.message,
        err.statusCode
      );
    }
  };

  async function createAccount(accountInfo: {
    email: string;
    password: string;
  }) {
    try {
      const data = await getData("/api/users?create=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountInfo),
      });

      userContext?.firstLogin(data.accessToken, data.data.numberOfRecipes);
    } catch (err: any) {
      throw err;
    }
  }

  return (
    <div
      className={styles.overlay__create_account}
      style={{
        opacity: !show ? "0" : "1",
        pointerEvents: !show ? "none" : "all",
      }}
      tabIndex={-1}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (e.currentTarget === target) onClickOutside();
      }}
    >
      <p
        className={styles.warning}
        style={{
          backgroundColor: error ? "orangered" : "rgba(255, 160, 16, 1)",
          display: !error && !isPending ? "none" : "block",
          width: formWidth,
          fontSize: warningFontSize,
        }}
      >
        {error
          ? error
          : language === "ja"
          ? "アカウント作成中…"
          : "Creating your account..."}
      </p>
      <form
        className={styles.form}
        style={{
          backgroundImage:
            "linear-gradient(rgb(221, 255, 96), rgb(114, 221, 43))",
          height: "fit-content",
          borderRadius: "2%",
          padding:
            mediaContext === "mobile"
              ? "3% 2% 4% 2%"
              : mediaContext === "tablet"
              ? "2%"
              : "2% 1% 1% 1%",
          width: formWidth,
        }}
        onSubmit={handleSubmit}
      >
        <button
          className={styles.btn__x}
          style={btnXDesign}
          type="button"
          onClick={onClickX}
        >
          &times;
        </button>
        <h2 className={styles.h2} style={{ fontSize: headerSize }}>
          {language === "ja" ? "アカウント作成" : "Sign-up"}
        </h2>
        <h4 style={h4Design}>
          {language === "ja"
            ? "メールアドレスを入力してください"
            : "Please enter your email address"}
        </h4>
        <div
          className={styles.input_wrapper}
          style={{
            width: inputWrapperWidth,
          }}
        >
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "email" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize,
            }}
            name="email"
            type="email"
            placeholder={language === "ja" ? "メールアドレス" : "email"}
          ></input>
        </div>
        <h4 style={h4Design}>
          {language === "ja"
            ? "使用するパスワードを入力してください"
            : "Please enter password you will use"}
        </h4>
        <p
          style={{
            backgroundImage:
              "linear-gradient(rgba(251, 255, 0, 0.664), rgba(255, 230, 0, 0.644))",
            width:
              mediaContext === "mobile"
                ? "80%"
                : mediaContext === "tablet"
                ? "80%"
                : mediaContext === "desktop"
                ? "75%"
                : "70%",
            height: "fit-content",
            letterSpacing: "0.05vw",
            padding: "1%",
            margin: "2% auto",
            borderRadius: "1% / 6%",
            fontSize,
          }}
        >
          {language === "ja"
            ? `${PASSWORD_MIN_LENGTH}文字以上で、大文字、小文字、数字を${PASSWORD_MIN_EACH}つずつ使用してください`
            : `Use ${PASSWORD_MIN_LENGTH} letters at minimum, including at least ${PASSWORD_MIN_EACH} uppercase, lowercase, and digit`}
        </p>
        <div
          className={styles.input_wrapper}
          style={{
            width: inputWrapperWidth,
          }}
        >
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "password" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize,
            }}
            name="password"
            type={!isPasswordVisible ? "password" : "text"}
            placeholder={language === "ja" ? "パスワード" : "password"}
          ></input>
          <button
            className={styles.btn__eye}
            style={{
              width: eyeOffWidth,
              opacity: isPasswordVisible ? "0" : "1",
            }}
            type="button"
            onClick={handleTogglePassword}
          ></button>
          <button
            className={styles.btn__eye_off}
            style={{
              width: eyeOnWidth,
              opacity: !isPasswordVisible ? "0" : "1",
            }}
            type="button"
            onClick={handleTogglePassword}
          ></button>
        </div>
        <button
          className={styles.btn__signup_submit}
          style={{ fontSize }}
          type="submit"
        >
          {language === "ja" ? "登録" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
