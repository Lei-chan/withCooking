"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import {
  KeyboardEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { redirect, RedirectType } from "next/navigation";

const TopHalf = function ({
  onLoginClick,
  onSignupClick,
}: {
  onLoginClick: () => void;
  onSignupClick: () => void;
}) {
  return (
    <div className={styles.top_half}>
      <div className={styles.login_signup}>
        <button className={styles.btn__login} onClick={onLoginClick}>
          Login
        </button>
        <button className={styles.btn__signup} onClick={onSignupClick}>
          Sign up
        </button>
      </div>
      <div className={styles.title_description}>
        <Image
          className={styles.title}
          src="/withCooking-title.gif"
          alt="withCooking"
          width={600}
          height={200}
        ></Image>
        <p className={styles.description}>
          In this app, all necessary and useful tools for cooking are included.
          <br />
          Store recipes, search your recipes, set multiple timers with titles,
          check nutrients for your recipes, etc.
          <br />
          This simple but userful app will become your cooking buddy :)
        </p>
      </div>
      <div className={styles.scroll}>
        <p>Scroll for more details</p>
        <p>&darr;</p>
      </div>
    </div>
  );
};

const BottomHalf = function () {
  return (
    <div className={styles.bottom_half}>
      <div className={styles.container__details}>
        <h1>Manage your favorite recipes in one app</h1>
        <div
          className={clsx(styles.details, styles.details__right)}
          data-details="0"
        >
          <h2>Create recipes</h2>
          <Image
            src="/grey-img.png"
            alt="create recipe image"
            width={604}
            height={460}
          ></Image>
          <p>
            You can create recipes with simple steps. Nutritional information is
            automatically created for your recipes, so it's useful to manage
            your diet.
            <br />
            You can also automatically convert ingredients/temperature units to
            various types of units, so you don't need to look up for different
            units on the Internet anymore!
          </p>
        </div>
        <div
          className={clsx(styles.details, styles.details__left)}
          data-details="1"
        >
          <h2>Search recipes</h2>
          <Image
            src="/grey-img.png"
            alt="search recipe image"
            width={604}
            height={460}
          ></Image>
          <p>You can search your recipes using keywords.</p>
        </div>
        <div
          className={clsx(styles.details, styles.details__right)}
          data-details="2"
        >
          <h2>Cook with recipes</h2>
          <Image
            src="/grey-img.png"
            alt="recipe image"
            width={604}
            height={460}
          ></Image>
          <p>
            You can edit and leave comments for recipes while cooking, so
            whenever you want to change your recipes, you can easily manage it.
          </p>
        </div>
        <div
          className={clsx(styles.details, styles.details__left)}
          data-details="3"
        >
          <h2>Set multiple timers</h2>
          <Image
            src="/grey-img.png"
            alt="setting timers image"
            width={604}
            height={460}
          ></Image>
          <p>
            You can set multiple timers with titles. Even if you aren't good at
            doing multiple cooking process at the same time, this feature would
            become your helper!
          </p>
        </div>
      </div>
      <h3>
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
};

const OverlayLogin = function ({
  show,
  isPasswordVisible,
  isWarningVisible,
  warningMessage,
  onClickX,
  onClickOutside,
  onClickEye,
  onSubmitLogin,
}: {
  show: Boolean;
  isPasswordVisible: Boolean;
  isWarningVisible: Boolean;
  warningMessage: String;
  onClickX: () => void;
  onClickOutside: () => void;
  onClickEye: () => void;
  onSubmitLogin: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className={clsx(styles.overlay__login, !show && styles.hidden)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (e.currentTarget === target) onClickOutside();
      }}
    >
      <p
        className={clsx(
          styles.warning,
          styles.warning__login,
          !isWarningVisible && styles.hidden
        )}
      >
        {warningMessage}
      </p>
      <form className={styles.form__login} onSubmit={onSubmitLogin}>
        <button className={styles.btn__x} type="button" onClick={onClickX}>
          &times;
        </button>
        <h2>Login</h2>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__login_username}
            name="username"
            type="email"
            placeholder="username"
          />
        </div>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__login_password}
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
            onClick={onClickEye}
          ></button>
          <button
            className={clsx(
              styles.btn__eye_off,
              !isPasswordVisible && styles.hidden
            )}
            type="button"
            onClick={onClickEye}
          ></button>
        </div>
        <button className={styles.btn__login} type="submit">
          Log in
        </button>
      </form>
    </div>
  );
};

const OverlayCreateAccount = function ({
  show,
  isPasswordVisible,
  isWarningVisible,
  warningMessage,
  onClickX,
  onClickOutside,
  onClickEye,
  onSubmitCreateAcc,
}: {
  show: Boolean;
  isPasswordVisible: Boolean;
  isWarningVisible: Boolean;
  warningMessage: String;
  onClickX: () => void;
  onClickOutside: () => void;
  onClickEye: () => void;
  onSubmitCreateAcc: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className={clsx(styles.overlay__create_account, !show && styles.hidden)}
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
          !isWarningVisible && styles.hidden
        )}
      >
        {warningMessage}
      </p>
      <form
        className={styles.form__create_account}
        onSubmit={onSubmitCreateAcc}
      >
        <button className={styles.btn__x} type="button" onClick={onClickX}>
          &times;
        </button>
        <h2>Sign-up</h2>
        <h3>Please enter your email address</h3>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__signup_username}
            name="username"
            type="email"
            placeholder="username"
          ></input>
        </div>
        <h3>Please enter password you want to use</h3>
        <p className={styles.requirements__password}>
          Use 8 letters at minimum including at least
          <br />1 uppercase, 1 lowercase, and 1 digit
        </p>
        <div className={styles.input_wrapper}>
          <input
            id={styles.input__signup_password}
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
            onClick={onClickEye}
          ></button>
          <button
            className={clsx(
              styles.btn__eye_off,
              !isPasswordVisible && styles.hidden
            )}
            type="button"
            onClick={onClickEye}
          ></button>
        </div>
        <button className={styles.btn__signup} type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
};

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isPasswordVisible, setPasswordIsVisible] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const handleToggleLogin = function () {
    setShowLogin(!showLogin);
    setPasswordIsVisible(false);
  };

  const handleToggleSignup = function () {
    setShowSignup(!showSignup);
    setPasswordIsVisible(false);
  };

  const handleTogglePassword = function () {
    setPasswordIsVisible(!isPasswordVisible);
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

  const handleSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const data = [...new FormData(e.currentTarget)];

      data.forEach((arr) => {
        if (!arr[1].toString().trim())
          throw new Error("Please fill the both fields.");
      });

      //loading

      //send data to server
    } catch (err: any) {
      setIsWarningVisible(true);
      return setWarningMessage(err.message);
    }

    //redirect to main
    redirect("/main", RedirectType.replace);
  };

  return (
    <div className={clsx(styles.page__first)}>
      <TopHalf
        onLoginClick={handleToggleLogin}
        onSignupClick={handleToggleSignup}
      />
      <BottomHalf />
      {(showLogin || showSignup) && (
        <div className={clsx(styles.overlay__first)}>
          <OverlayLogin
            show={showLogin ? true : false}
            isPasswordVisible={isPasswordVisible}
            isWarningVisible={isWarningVisible}
            warningMessage={warningMessage}
            onClickX={handleToggleLogin}
            onClickOutside={handleToggleLogin}
            onClickEye={handleTogglePassword}
            onSubmitLogin={handleSubmit}
          />
          <OverlayCreateAccount
            show={showSignup ? true : false}
            isPasswordVisible={isPasswordVisible}
            isWarningVisible={isWarningVisible}
            warningMessage={warningMessage}
            onClickX={handleToggleSignup}
            onClickOutside={handleToggleSignup}
            onClickEye={handleTogglePassword}
            onSubmitCreateAcc={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
