"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { redirect, RedirectType } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  APP_EXPLANATIONS,
  PASSWORD_MIN_DIGIT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_UPPERCASE,
} from "../config";
import { error } from "console";
import { validatePassword } from "../helper";
import { nanoid } from "nanoid";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Error from "./error";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const errorMsgEmpty = "※Please fill the field";

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
            width={700}
            height={200}
          ></Image>
          <p className={styles.description}>
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
            fontSize: "1.4vw",
            letterSpacing: "0.05vw",
          }}
        >
          <p>Scroll for more details</p>
          <p>&darr;</p>
        </div>
      </div>
      <BottomHalf />
      {/* <ErrorBoundary fallback={<Error />}> */}
      <OverlayLogin
        show={showLogin ? true : false}
        errorMsgEmpty={errorMsgEmpty}
        onClickX={handleToggleLogin}
        onClickOutside={handleToggleLogin}
      />
      <OverlayCreateAccount
        show={showSignup ? true : false}
        errorMsgEmpty={errorMsgEmpty}
        onClickX={handleToggleSignup}
        onClickOutside={handleToggleSignup}
      />
      {/* </ErrorBoundary> */}
    </div>
  );
}

function Buttons({
  onLoginClick,
  onSignupClick,
}: {
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
        width: "20%",
        aspectRatio: "1 / 0.25",
      }}
    >
      <button className={styles.btn__login} onClick={onLoginClick}>
        Login
      </button>
      <button className={styles.btn__signup} onClick={onSignupClick}>
        Sign up
      </button>
    </div>
  );
}

function BottomHalf() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.02,
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Details />
      <h3
        ref={ref}
        className={clsx(
          styles.last_comment,
          inView && styles.appear_slow__comment
        )}
      >
        Let's start <span>withCooking</span> by signing up for free
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

function Details() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.02,
  });

  return (
    <div className={styles.container__details}>
      <h1
        ref={ref}
        className={styles.heading}
        style={{
          transform: !inView
            ? "translateX(-100%) skewX(-17deg)"
            : "translateX(0%) skewX(-17deg)",
        }}
      >
        Manage your favorite recipes in one app
      </h1>
      {APP_EXPLANATIONS.map((explanation, i) => (
        <Explanation key={nanoid()} explanation={explanation} i={i} />
      ))}
    </div>
  );
}

function Explanation({
  explanation,
  i,
}: {
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

  ///even number details appear from right, odd number from left
  return (
    <div
      ref={ref}
      className={clsx(
        styles.details,
        !inView && isEven && styles.original_position__right,
        !inView && !isEven && styles.original_position__left,
        inView && isEven && styles.slide_in__right,
        inView && !isEven && styles.slide_in__left
      )}
    >
      <h2>{explanation.title}</h2>
      <Image
        src={explanation.image || "/grey-img.png"}
        alt={`${explanation.title} image`}
        width={604}
        height={460}
      ></Image>
      <p>{explanation.explanation}</p>
    </div>
  );
}

function OverlayLogin({
  show,
  errorMsgEmpty,
  onClickX,
  onClickOutside,
}: {
  show: Boolean;
  errorMsgEmpty: string;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
  const [isPasswordVisible, setPasswordIsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [errorFields, setErrorFields] = useState<
    "email" | "password" | "both"
  >();

  const handleTogglePassword = function () {
    setPasswordIsVisible(!isPasswordVisible);
  };

  const handleSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const [[email, emailValue], [password, passwordValue]] = [
      ...new FormData(e.currentTarget),
    ];

    const trimmedEmail = emailValue.toString().trim();
    const trimmedPassword = passwordValue.toString().trim();

    if (!trimmedEmail && !trimmedPassword) {
      setErrorFields("both");
      return setErrorMsg("※Please fill both fields");
    }

    if (!trimmedEmail) {
      setErrorFields("email");
      return setErrorMsg("※Please fill the field");
    }

    if (!trimmedPassword) {
      setErrorFields("password");
      return setErrorMsg("※Please fill the field");
    }

    if (!validatePassword(trimmedPassword)) {
      setErrorFields("password");
      return setErrorMsg("※Please set password that meets the requirements.");
    }

    //loading

    //send data to server

    //redirect to main
    redirect("/main", RedirectType.replace);
  };

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
          !errorMsg && styles.hidden
        )}
      >
        {errorMsg}
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
  show,
  errorMsgEmpty,
  onClickX,
  onClickOutside,
}: {
  show: Boolean;
  errorMsgEmpty: string;
  onClickX: () => void;
  onClickOutside: () => void;
}) {
  const [isPasswordVisible, setPasswordIsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [errorFields, setErrorFields] = useState<
    "email" | "password" | "both"
  >();

  const handleTogglePassword = function () {
    setPasswordIsVisible(!isPasswordVisible);
  };

  const handleSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const [[email, emailValue], [password, passwordValue]] = [
      ...new FormData(e.currentTarget),
    ];

    const trimmedEmail = emailValue.toString().trim();
    const trimmedPassword = passwordValue.toString().trim();

    if (!trimmedEmail && !trimmedPassword) {
      setErrorFields("both");
      return setErrorMsg("※Please fill both fields");
    }

    if (!trimmedEmail) {
      setErrorFields("email");
      return setErrorMsg("※Please fill the field");
    }

    if (!trimmedPassword) {
      setErrorFields("password");
      return setErrorMsg("※Please fill the field");
    }

    if (!validatePassword(trimmedPassword)) {
      setErrorFields("password");
      return setErrorMsg("※Please set password that meets the requirements.");
    }

    redirect("/main", RedirectType.replace);
  };

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
          styles.warning__create_account,
          !errorMsg && styles.hidden
        )}
      >
        {errorMsg}
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
