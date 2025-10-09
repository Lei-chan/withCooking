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
  MEDIA,
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
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        zIndex: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
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
                  ? "3.2vw"
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
                ? "3vw"
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
        show={showLogin ? true : false}
        onClickX={handleToggleLogin}
        onClickOutside={handleToggleLogin}
      />
      <OverlayCreateAccount
        mediaContext={mediaContext}
        userContext={userContext}
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
  mediaContext: MEDIA;
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
        by signing up for free
      </h3>
      <footer className={styles.footer}>
        <Link href="https://www.instagram.com/leichanweb?igsh=NzJmb3Axc3ZvNWN6&utm_source=qr">
          <button className={styles.btn__instagram}></button>
        </Link>
        <Link href="https://github.com/Lei-chan">
          <button className={styles.btn__github}></button>
        </Link>
        <Link href="">
          <button className={styles.btn__feedback}></button>
        </Link>
        <p className={styles.attribution}>Designed by Freepik</p>
        <p className={styles.copyright}>© 2025 Lei-chan</p>
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
        marginTop: "10%",
        padding: "7% 5%",
        backgroundImage: "linear-gradient(#ffffee, #fff5d6 8%, #feffc4)",
      }}
    >
      <h1
        ref={ref}
        className={styles.heading}
        style={{
          position: "absolute",
          top: "-3%",
          left: "2%",
          backgroundImage:
            "linear-gradient(150deg, rgb(255, 230, 0) 10%, rgb(255, 102, 0))",
          width: "fit-content",
          height: "fit-content",
          letterSpacing: "0.15vw",
          wordSpacing: "0.3vw",
          padding: "2% 3.5%",
          color: "rgb(119, 87, 0)",
          transition: "all 1s",
          boxShadow: "rgba(0, 0, 0, 0.301) 3px 3px 8px",
          transform: !inView
            ? "translateX(-100%) skewX(-17deg)"
            : "translateX(0%) skewX(-17deg)",
          fontSize:
            mediaContext === "mobile"
              ? "4vw"
              : mediaContext === "tablet"
              ? "3vw"
              : mediaContext === "desktop"
              ? "2.6vw"
              : "2.6vw",
        }}
      >
        Manage your favorite recipes in one app
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

  const checkIsEven = () => (i % 2 === 0 ? true : false);
  const isEven = checkIsEven();

  function transform() {
    let transform;
    if (!inView && isEven) return "translateX(100%)";
    if (!inView && !isEven) return "translateX(-100%)";
    if (inView && isEven) {
      return mediaContext === "mobile"
        ? "translateX(0%)"
        : mediaContext === "tablet"
        ? "translateX(-10%)"
        : mediaContext === "desktop"
        ? "translateX(-10%)"
        : "translateX(-10%)";
    }

    if (inView && !isEven) {
      return mediaContext === "mobile"
        ? "translateX(0%)"
        : mediaContext === "tablet"
        ? "translateX(10%)"
        : mediaContext === "desktop"
        ? "translateX(10%)"
        : "translateX(10%)";
    }
  }

  ///even number details appear from right, odd number from left
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "80%",
        height: "fit-content",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8%",
        marginTop:
          mediaContext === "mobile"
            ? "10%"
            : mediaContext === "tablet"
            ? "10%"
            : mediaContext === "desktop"
            ? "7%"
            : "7%",
        padding: "4%",
        backgroundColor: "#fffbe6",
        textAlign: "left",
        borderRadius: "1% / 2.3%",
        boxShadow: "rgba(0, 0, 0, 0.301) 5px 5px 10px",
        transition: "all 1s",
        transform:
          !inView && isEven
            ? "translateX(100%)"
            : !inView && !isEven
            ? "translateX(-100%)"
            : inView && isEven
            ? "translateX(-10%)"
            : "translateX(10%)",
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
          top: "-8%",
          left:
            mediaContext === "mobile"
              ? "40%"
              : mediaContext === "tablet"
              ? "53%"
              : mediaContext === "desktop"
              ? "56%"
              : "56%",
          fontSize:
            mediaContext === "mobile"
              ? "5vw"
              : mediaContext === "tablet"
              ? "3vw"
              : mediaContext === "desktop"
              ? "2.6vw"
              : "2.6vw",
        }}
      >
        {explanation.title}
      </h2>
      <Image
        src={explanation.image}
        alt={`${explanation.title} image`}
        width={
          mediaContext === "mobile"
            ? 280
            : mediaContext === "tablet"
            ? 604
            : mediaContext === "desktop"
            ? 604
            : 604
        }
        height={
          mediaContext === "mobile"
            ? 100
            : mediaContext === "tablet"
            ? 460
            : mediaContext === "desktop"
            ? 460
            : 460
        }
      ></Image>
      <p
        style={{
          fontSize:
            mediaContext === "mobile"
              ? "3vw"
              : mediaContext === "tablet"
              ? "3vw"
              : mediaContext === "desktop"
              ? "2.6vw"
              : "2.6vw",
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
  show,
  onClickX,
  onClickOutside,
}: {
  mediaContext: string;
  userContext: any;
  show: Boolean;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
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

      userContext?.firstLogin(data.accessToken);
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
        className={clsx(
          styles.warning,
          styles.warning__login,
          !error && !isPending && styles.hidden
        )}
        style={{
          backgroundColor: error ? "orangered" : "rgba(255, 160, 16, 1)",
        }}
      >
        {error ? error : "Loging in..."}
      </p>
      <form className={styles.form__login} onSubmit={handleSubmit}>
        <button className={styles.btn__x} type="button" onClick={onClickX}>
          &times;
        </button>
        <h2>Login</h2>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__login_username}
            style={{
              borderColor:
                errorFields === "email" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
            }}
            name="email"
            type="email"
            placeholder="email"
          />
        </div>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__login_password}
            style={{
              borderColor:
                errorFields === "password" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
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
            type="button"
            onClick={handleTogglePassword}
          ></button>
          <button
            className={clsx(
              styles.btn__eye_off,
              !isPasswordVisible && styles.hidden
            )}
            type="button"
            onClick={handleTogglePassword}
          ></button>
        </div>
        <button className={styles.btn__submit_login} type="submit">
          Log in
        </button>
      </form>
    </div>
  );
}

function OverlayCreateAccount({
  mediaContext,
  userContext,
  show,
  onClickX,
  onClickOutside,
}: {
  mediaContext: string;
  userContext: any;
  show: Boolean;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
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

      // if (!trimmedEmail) {
      //   setErrorFields("email");
      //   return setErrorMsg("※Please fill the field");
      // }

      // if (!trimmedPassword) {
      //   setErrorFields("password");
      //   return setErrorMsg("※Please fill the field");
      // }

      // if (!validatePassword(trimmedPassword)) {
      //   setErrorFields("password");
      //   return setErrorMsg("※Please set password that meets the requirements.");
      // }

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

      userContext?.login(data.accessToken);

      console.log(data);
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
        className={clsx(
          styles.warning,
          styles.warning__login,
          !error && !isPending && styles.hidden
        )}
        style={{
          backgroundColor: error ? "orangered" : "rgba(255, 160, 16, 1)",
        }}
      >
        {error ? error : "Creating your account..."}
      </p>
      <form className={styles.form__create_account} onSubmit={handleSubmit}>
        <button className={styles.btn__x} type="button" onClick={onClickX}>
          &times;
        </button>
        <h2>Sign-up</h2>
        <h3>Please enter your email address</h3>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__signup_username}
            style={{
              borderColor:
                errorFields === "email" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
            }}
            name="email"
            type="email"
            placeholder="email"
          ></input>
        </div>
        <h3>Please enter password you want to use</h3>
        <p className={styles.requirements__password}>
          Use {PASSWORD_MIN_LENGTH} letters at minimum, including at least
          <br />
          {PASSWORD_MIN_UPPERCASE} uppercase, {PASSWORD_MIN_LOWERCASE}{" "}
          lowercase, and {PASSWORD_MIN_DIGIT} digit
        </p>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__signup_password}
            style={{
              borderColor:
                errorFields === "password" || errorFields === "both"
                  ? "orangered"
                  : " #0000004f",
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
            type="button"
            onClick={handleTogglePassword}
          ></button>
          <button
            className={clsx(
              styles.btn__eye_off,
              !isPasswordVisible && styles.hidden
            )}
            type="button"
            onClick={handleTogglePassword}
          ></button>
        </div>
        <button className={styles.btn__signup} type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
}
