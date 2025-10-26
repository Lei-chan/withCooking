"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState, useContext } from "react";
import { redirect, RedirectType } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  APP_EXPLANATIONS,
  MAX_MOBILE,
  MAX_TABLET,
  TYPE_MEDIA,
  MIN_TABLET,
  PASSWORD_MIN_DIGIT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_UPPERCASE,
} from "./lib/config";
import { getData } from "@/app/lib/helper";
import { UserContext, MediaContext } from "./lib/providers";

export default function Home() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);

  //design
  const warningFontSize =
    mediaContext === "mobile"
      ? "4.5vw"
      : mediaContext === "tablet"
      ? "2.5vw"
      : mediaContext === "desktop"
      ? "1.5vw"
      : "1.3vw";
  const inputWrapperDesign = {
    width:
      mediaContext === "mobile"
        ? "72%"
        : mediaContext === "tablet"
        ? "68%"
        : "65%",
    aspectRatio: mediaContext === "mobile" ? "1 / 0.12" : "1 / 0.1",
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: "4% auto 6% auto",
  };
  const inputFontSize =
    mediaContext === "mobile"
      ? "4.5vw"
      : mediaContext === "tablet"
      ? "2.5vw"
      : mediaContext === "desktop"
      ? "1.6vw"
      : "1.4vw";
  const btnXDesign = {
    top:
      mediaContext === "mobile"
        ? "-1%"
        : mediaContext === "tablet"
        ? "-1%"
        : "0%",
    fontSize:
      mediaContext === "mobile"
        ? "7vw"
        : mediaContext === "tablet"
        ? "4vw"
        : mediaContext === "desktop"
        ? "2.5vw"
        : "2.2vw",
  };
  const headingDesign = {
    fontSize:
      mediaContext === "mobile"
        ? "7vw"
        : mediaContext === "tablet"
        ? "3.8vw"
        : mediaContext === "desktop"
        ? "2.6vw"
        : "2.1vw",
  };
  const eyeOnDesign = {
    width:
      mediaContext === "mobile"
        ? "12%"
        : mediaContext === "tablet"
        ? "10%"
        : mediaContext === "desktop"
        ? "9.3%"
        : "9%",
  };
  const eyeOffDesign = {
    width:
      mediaContext === "mobile"
        ? "11%"
        : mediaContext === "tablet"
        ? "9%"
        : mediaContext === "desktop"
        ? "8.3%"
        : "8%",
  };
  const btnSubmitDesign = {
    fontSize:
      mediaContext === "mobile"
        ? "4.3vw"
        : mediaContext === "tablet"
        ? "2.6vw"
        : mediaContext === "desktop"
        ? "1.6vw"
        : "1.4vw",
    marginTop:
      mediaContext === "mobile"
        ? "0"
        : mediaContext === "tablet"
        ? "1%"
        : mediaContext === "desktop"
        ? "2%"
        : "2%",
  };

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
        width: "100%",
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
        <Buttons
          mediaContext={mediaContext}
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
            src="/withCooking-title.gif"
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
          ></Image>
          <p
            className={styles.description}
            style={{
              width: "100%",
              lineHeight: "150%",
              fontSize:
                mediaContext === "mobile"
                  ? "4vw"
                  : mediaContext === "tablet"
                  ? "2.4vw"
                  : mediaContext === "desktop"
                  ? "2vw"
                  : "2vw",
            }}
          >
            In this app, all necessary and useful tools for cooking are
            included.
            <br />
            Store recipes, search your recipes, set multiple timers with titles,
            check nutrients for your recipes, etc.
            <br />
            This simple but userful app will become your cooking buddy :)
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
            fontSize:
              mediaContext === "mobile"
                ? "4vw"
                : mediaContext === "tablet"
                ? "2vw"
                : mediaContext === "desktop"
                ? "1.6vw"
                : "1.6vw",
          }}
        >
          <p>Scroll for more details</p>
          <p>&darr;</p>
        </div>
      </div>
      <BottomHalf mediaContext={mediaContext} />
      <OverlayLogin
        mediaContext={mediaContext}
        userContext={userContext}
        warningFontSize={warningFontSize}
        inputWrapperDesign={inputWrapperDesign}
        inputFontSize={inputFontSize}
        btnXDesign={btnXDesign}
        headingDesign={headingDesign}
        eyeOnDesign={eyeOnDesign}
        eyeOffDesign={eyeOffDesign}
        btnSubmitDesign={btnSubmitDesign}
        show={showLogin ? true : false}
        onClickX={handleToggleLogin}
        onClickOutside={handleToggleLogin}
      />
      <OverlayCreateAccount
        mediaContext={mediaContext}
        userContext={userContext}
        warningFontSize={warningFontSize}
        inputWrapperDesign={inputWrapperDesign}
        inputFontSize={inputFontSize}
        btnXDesign={btnXDesign}
        headingDesign={headingDesign}
        eyeOnDesign={eyeOnDesign}
        eyeOffDesign={eyeOffDesign}
        btnSubmitDesign={btnSubmitDesign}
        show={showSignup ? true : false}
        onClickX={handleToggleSignup}
        onClickOutside={handleToggleSignup}
      />
    </div>
  );
}

function Buttons({
  mediaContext,
  onLoginClick,
  onSignupClick,
}: {
  mediaContext: TYPE_MEDIA;
  onLoginClick: () => void;
  onSignupClick: () => void;
}) {
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
          fontSize:
            mediaContext === "mobile"
              ? "5vw"
              : mediaContext === "tablet"
              ? "3vw"
              : mediaContext === "desktop"
              ? "2vw"
              : "1.7vw",
        }}
        onClick={onLoginClick}
      >
        Login
      </button>
      <button
        className={styles.btn__signup}
        style={{
          fontSize:
            mediaContext === "mobile"
              ? "5vw"
              : mediaContext === "tablet"
              ? "3vw"
              : mediaContext === "desktop"
              ? "2vw"
              : "1.7vw",
        }}
        onClick={onSignupClick}
      >
        Sign up
      </button>
    </div>
  );
}

function BottomHalf({ mediaContext }: { mediaContext: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.02,
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Details mediaContext={mediaContext} />
      <h3
        ref={ref}
        style={{
          letterSpacing: "0.15vw",
          wordSpacing: "0.3vw",
          fontStyle: "italic",
          margin: "8%",
          borderBottom: "thin solid red",
          width: "fit-content",
          fontSize:
            mediaContext === "mobile"
              ? "6vw"
              : mediaContext === "tablet"
              ? "4vw"
              : "2.8vw",
          transition: "all 1.5s",
          opacity: inView ? "1" : "0",
          transform: inView ? "scale(100%)" : "scale(90%)",
        }}
      >
        Let's start{" "}
        <span
          style={{
            backgroundImage:
              "linear-gradient(150deg,rgb(252, 255, 99) 10%,rgb(255, 115, 0))",
            padding: "1% 0%",
            borderRadius: "100% 10%",
          }}
        >
          withCooking
        </span>{" "}
        by {(mediaContext === "mobile" || mediaContext === "tablet") && <br />}
        signing up for free
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
              backgroundImage: 'url("/instagram.png")',
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
              backgroundImage: 'url("/github.svg")',
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
        <Link className={styles.link__footer} href="">
          <button
            className={styles.link__button}
            style={{
              backgroundImage: 'url("/feedback.png")',
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

function Details({ mediaContext }: { mediaContext: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.02,
  });

  return (
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
          top: "-3%",
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
          fontSize:
            mediaContext === "mobile"
              ? "6vw"
              : mediaContext === "tablet"
              ? "3.9vw"
              : "2.6vw",
        }}
      >
        Manage your favorite recipes{mediaContext === "mobile" && <br />} in one
        app
      </h1>
      {APP_EXPLANATIONS.map((explanation, i) => (
        <Explanation
          key={i}
          mediaContext={mediaContext}
          explanation={explanation}
          i={i}
        />
      ))}
    </div>
  );
}

function Explanation({
  mediaContext,
  explanation,
  i,
}: {
  mediaContext: string;
  explanation: {
    title: string;
    image: string;
    explanation: string;
  };
  i: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.02 });
  const [transform, setTransform] = useState("");

  const checkIsEven = () => (i % 2 === 0 ? true : false);
  const isEven = checkIsEven();

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
            ? "90%"
            : mediaContext === "desktop"
            ? "80%"
            : "70%",
        height: "fit-content",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "5%",
        marginTop:
          mediaContext === "mobile"
            ? "15%"
            : mediaContext === "tablet"
            ? "10%"
            : mediaContext === "desktop"
            ? "7%"
            : "7%",
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
          backgroundImage:
            "linear-gradient(150deg,rgb(198, 233, 1) 5%,rgb(129, 199, 0))",
          width: "fit-content",
          height: "fit-content",
          letterSpacing: "0.15vw",
          padding: "0.6% 3%",
          transform: "skewX(-17deg)",
          color: "aliceblue",
          whiteSpace: "nowrap",
          top: "-4vh",
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
              ? "4vw"
              : mediaContext === "desktop"
              ? "3vw"
              : "2.6vw",
        }}
      >
        {explanation.title}
      </h2>
      <div
        style={{
          position: "relative",
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          // fill
          src={explanation.image}
          alt={`${explanation.title} image`}
          width={
            mediaContext === "mobile"
              ? 140
              : mediaContext === "tablet"
              ? 300
              : mediaContext === "desktop"
              ? 350
              : 400
          }
          height={
            mediaContext === "mobile"
              ? 140 * 0.7
              : mediaContext === "tablet"
              ? 300 * 0.7
              : mediaContext === "desktop"
              ? 350 * 0.7
              : 400 * 0.7
          }
        ></Image>
      </div>
      <p
        style={{
          width: "43%",
          height: "fit-content",
          fontSize:
            mediaContext === "mobile"
              ? "4vw"
              : mediaContext === "tablet"
              ? "2.7vw"
              : mediaContext === "desktop"
              ? "2vw"
              : "1.7vw",
          letterSpacing: "0.06vw",
          lineHeight: "140%",
        }}
      >
        {explanation.explanation}
      </p>
    </div>
  );
}
function OverlayLogin({
  mediaContext,
  userContext,
  warningFontSize,
  inputWrapperDesign,
  inputFontSize,
  btnXDesign,
  headingDesign,
  eyeOnDesign,
  eyeOffDesign,
  btnSubmitDesign,
  show,
  onClickX,
  onClickOutside,
}: {
  mediaContext: string;
  userContext: any;
  warningFontSize: string;
  inputWrapperDesign: object;
  inputFontSize: string;
  btnXDesign: object;
  headingDesign: object;
  eyeOnDesign: object;
  eyeOffDesign: object;
  btnSubmitDesign: object;
  show: Boolean;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
  //design
  const formWidth =
    mediaContext === "mobile"
      ? "85%"
      : mediaContext === "tablet"
      ? "50%"
      : mediaContext === "desktop"
      ? "35%"
      : "30%";
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
        return setError("※Please fill both fields");
      }

      //send data to server
      await login({
        email: trimmedEmail,
        password: trimmedPassword,
      });
    } catch (err: any) {
      setError(err.message);
      err.message.includes("password") && setErrorFields("password");
      err.message.includes("email") && setErrorFields("email");

      return console.error(
        "Error while loging in",
        err.message,
        err.statusCode || 500
      );
    }
    //redirect to main
    redirect("/main", RedirectType.replace);
  };

  async function login(accountInfo: { email: string; password: string }) {
    try {
      const data = await getData("/api/users?create=false", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountInfo),
      });

      console.log(data.data);

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
        {error ? error : "Loging in..."}
      </p>
      <form
        style={{
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
        <h2 style={headingDesign}>Login</h2>
        <div className={styles.input_wrapper} style={inputWrapperDesign}>
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "email" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize: inputFontSize,
            }}
            name="email"
            type="email"
            placeholder="email"
          />
        </div>
        <div className={styles.input_wrapper} style={inputWrapperDesign}>
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "password" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize: inputFontSize,
            }}
            type={!isPasswordVisible ? "password" : "text"}
            name="password"
            placeholder="password"
          />
          <button
            className={clsx(
              styles.btn__eye,
              isPasswordVisible && styles.hidden
            )}
            style={eyeOnDesign}
            type="button"
            onClick={handleTogglePassword}
          ></button>
          <button
            className={clsx(
              styles.btn__eye_off,
              !isPasswordVisible && styles.hidden
            )}
            style={eyeOffDesign}
            type="button"
            onClick={handleTogglePassword}
          ></button>
        </div>
        <button
          className={styles.btn__submit_login}
          style={btnSubmitDesign}
          type="submit"
        >
          Log in
        </button>
      </form>
    </div>
  );
}

function OverlayCreateAccount({
  mediaContext,
  userContext,
  warningFontSize,
  inputWrapperDesign,
  inputFontSize,
  btnXDesign,
  headingDesign,
  eyeOnDesign,
  eyeOffDesign,
  btnSubmitDesign,
  show,
  onClickX,
  onClickOutside,
}: {
  mediaContext: string;
  userContext: any;
  warningFontSize: string;
  inputWrapperDesign: object;
  inputFontSize: string;
  btnXDesign: object;
  headingDesign: object;
  eyeOnDesign: object;
  eyeOffDesign: object;
  btnSubmitDesign: object;
  show: Boolean;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
  //design
  const formWidth =
    mediaContext === "mobile"
      ? "80%"
      : mediaContext === "tablet"
      ? "50%"
      : mediaContext === "desktop"
      ? "39%"
      : "39%";
  const h4Design = {
    fontSize:
      mediaContext === "mobile"
        ? "4.5vw"
        : mediaContext === "tablet"
        ? "2.7vw"
        : mediaContext === "desktop"
        ? "1.55vw"
        : "1.5vw",
    letterSpacing: "0.08vw",
  };

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
        return setError("※Please fill both fields");
      }

      await createAccount({ email: trimmedEmail, password: trimmedPassword });
    } catch (err: any) {
      setError(err.message);
      setErrorFields(err.message.includes("email") ? "email" : "password");

      return console.error(
        "error while creating account",
        err.message,
        err.statusCode
      );
    }

    redirect("/main", RedirectType.replace);
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

      userContext?.login(data.accessToken, data.data.numberOfRecipes);
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
        {error ? error : "Creating your account..."}
      </p>
      <form
        style={{
          backgroundImage:
            "linear-gradient(rgb(221, 255, 96), rgb(114, 221, 43))",
          // aspectRatio: "1 / 0.9",
          height: "fit-content",
          borderRadius: "2%",
          padding:
            mediaContext === "mobile"
              ? "3% 2% 6% 2%"
              : mediaContext === "tablet"
              ? "3% 2% 4% 2%"
              : "2% 1%",
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
        <h2 style={headingDesign}>Sign-up</h2>
        <h4 style={h4Design}>Please enter your email address</h4>
        <div
          style={{
            ...inputWrapperDesign,
            height:
              mediaContext === "mobile"
                ? "8%"
                : mediaContext === "tablet"
                ? "7%"
                : mediaContext === "desktop"
                ? "7%"
                : "5%",
          }}
        >
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "email" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize: inputFontSize,
            }}
            name="email"
            type="email"
            placeholder="email"
          ></input>
        </div>
        <h4 style={h4Design}>Please enter password you want to use</h4>
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
            fontSize:
              mediaContext === "mobile"
                ? "4.3vw"
                : mediaContext === "tablet"
                ? "2.5vw"
                : mediaContext === "desktop"
                ? "1.4vw"
                : "2vw",
          }}
        >
          Use {PASSWORD_MIN_LENGTH} letters at minimum, including at least
          <br />
          {PASSWORD_MIN_UPPERCASE} uppercase, {PASSWORD_MIN_LOWERCASE}{" "}
          lowercase, and {PASSWORD_MIN_DIGIT} digit
        </p>
        <div
          style={{
            ...inputWrapperDesign,
            height:
              mediaContext === "mobile"
                ? "8%"
                : mediaContext === "tablet"
                ? "7%"
                : mediaContext === "desktop"
                ? "7%"
                : "5%",
          }}
        >
          <input
            className={styles.input}
            style={{
              borderColor:
                errorFields === "password" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
              fontSize: inputFontSize,
            }}
            name="password"
            type={!isPasswordVisible ? "password" : "text"}
            placeholder="password"
          ></input>
          <button
            className={clsx(
              styles.btn__eye,
              isPasswordVisible && styles.hidden
            )}
            style={eyeOnDesign}
            type="button"
            onClick={handleTogglePassword}
          ></button>
          <button
            className={clsx(
              styles.btn__eye_off,
              !isPasswordVisible && styles.hidden
            )}
            style={eyeOffDesign}
            type="button"
            onClick={handleTogglePassword}
          ></button>
        </div>
        <button
          className={styles.btn__signup}
          style={btnSubmitDesign}
          type="submit"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}
