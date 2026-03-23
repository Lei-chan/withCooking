"use client";
//react
import { useEffect, useState, useContext } from "react";
import clsx from "clsx";
//next.js
import { useParams, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
//css
import styles from "./page.module.css";
//context
import { MediaContext, UserContext } from "../../lib/providers";
// components
import OverlayGeneralMessage from "../components/OverlayGeneralMessage/OverlayGeneralMessage";
//type
import {
  TYPE_LANGUAGE,
  TYPE_USER,
  TYPE_USER_CONTEXT,
  TYPE_USER_RECIPE,
  TYPE_USER_RECIPE_LINK,
} from "@/app/lib/config/type";
//settings
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_EACH,
} from "../../lib/config/settings";
//general methods
import {
  authErrorRedirect,
  generateErrorMessage,
  getData,
  getFontSizeForLanguage,
  isApiError,
  logNonApiError,
  wait,
} from "@/app/lib/helpers/other";

export default function Account() {
  const router = useRouter();

  //language
  const { locale } = useParams<{ locale: TYPE_LANGUAGE }>();

  //design
  const mediaContext = useContext(MediaContext);

  const formWidth =
    mediaContext === "mobile"
      ? "84%"
      : mediaContext === "tablet"
        ? "60%"
        : "40%";
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.7vw"
      : mediaContext === "tablet"
        ? "3vw"
        : mediaContext === "desktop"
          ? "1.7vw"
          : "1.4vw";
  const fontSizeFinal = getFontSizeForLanguage(locale, fontSizeEn);
  const smallHeaderSize = `calc(${fontSizeFinal} * 1.1)`;
  const inputWidth = mediaContext === "mobile" ? "80%" : "55%";
  const btnSize = `calc(${fontSizeFinal} * 0.9)`;

  //user
  const userContext = useContext(UserContext);
  const [user, setUser] = useState<TYPE_USER>();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isOverlayMsgVisible, setIsOverlayMsgVisible] = useState(false);

  async function getUser() {
    try {
      const data = await getData("/api/users", {
        method: "GET",
        headers: {
          authorization: `Bearer ${userContext?.accessToken}`,
        },
      });

      setUser(data.data);

      //set newAccessToken for context when it's refreshed
      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while getting user information");

      console.error(
        "Error while getting user information",
        err.message,
        err.statusCode || 500,
      );

      const errorMessage = generateErrorMessage(locale, err, "user");

      setError(
        errorMessage ||
          (locale === "ja"
            ? "サーバーエラーが発生しました🙇‍♂️リロードして再びお試しください"
            : "Server error 🙇‍♂️ Please reload this page and try again"),
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  useEffect(() => {
    (async () => await getUser())();
  }, []);

  async function displayMessage(message: string) {
    setMessage(message);
    await wait();
    setMessage("");
  }

  function toggleMessageVisible() {
    setIsOverlayMsgVisible(!isOverlayMsgVisible);
  }

  return (
    <div
      style={{
        backgroundColor: "#b3f8dbff",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        padding: "2% 0 5% 0",
        overflowX: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: `calc(${fontSizeFinal} * 1.3)`,
          letterSpacing: "0.1vw",
          wordSpacing: "0.3vw",
          margin: fontSizeFinal,
          color: "#0d0081ff",
        }}
      >
        {locale === "ja" ? "アカウント" : "Account"}
      </h1>
      {(error || message) && (
        <p
          style={{
            width: formWidth,
            backgroundColor: error ? "orangered" : "#68e204ff",
            padding: "1% 3%",
            borderRadius: "2% / 19%",
            color: "white",
            fontSize: fontSizeFinal,
            letterSpacing: "0.07vw",
          }}
        >
          {error || message}
        </p>
      )}
      {!user && (
        <div
          style={{
            backgroundColor: "#fffdcdff",
            width: formWidth,
            aspectRatio: "1/1.3",
            marginTop: "2%",
            borderRadius: "1.1%/1.4%",
          }}
          className={styles.loading}
        ></div>
      )}
      {user && (
        <div
          style={{
            backgroundImage: "linear-gradient(#fffedbff, #fffdcdff)",
            width: formWidth,
            maxHeight: "fit-content",
            marginTop: "1.8%",
            borderRadius: "1.1%/1.4%",
            boxShadow: "#0000007c 3px 3px 10px",
            padding: "1% 0",
          }}
        >
          <Email
            router={router}
            language={locale}
            userContext={userContext}
            fontSize={fontSizeFinal}
            smallHeaderSize={smallHeaderSize}
            inputWidth={inputWidth}
            btnSize={btnSize}
            email={user.email}
            displayMessage={displayMessage}
          />
          <Password
            router={router}
            language={locale}
            userContext={userContext}
            fontSize={fontSizeFinal}
            smallHeaderSize={smallHeaderSize}
            inputWidth={inputWidth}
            btnSize={btnSize}
            displayMessage={displayMessage}
          />
          <Since
            language={locale}
            fontSize={fontSizeFinal}
            smallHeaderSize={smallHeaderSize}
            since={user.createdAt}
          />
          <CloseAccount
            router={router}
            language={locale}
            userContext={userContext}
            fontSize={fontSizeFinal}
            smallHeaderSize={smallHeaderSize}
            btnSize={btnSize}
            recipes={user.recipes || []}
            toggleMessageVisible={toggleMessageVisible}
          />
        </div>
      )}
      {isOverlayMsgVisible && (
        <OverlayGeneralMessage
          language={locale}
          mediaContext={mediaContext}
          option="message"
          content="close"
        ></OverlayGeneralMessage>
      )}
    </div>
  );
}

function Email({
  router,
  language,
  userContext,
  fontSize,
  smallHeaderSize,
  inputWidth,
  btnSize,
  email,
  displayMessage,
}: {
  router: AppRouterInstance;
  language: TYPE_LANGUAGE;
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  smallHeaderSize: string;
  inputWidth: string;
  btnSize: string;
  email: string;
  displayMessage: (message: string) => void;
}) {
  const [change, setChange] = useState(false);
  const [value, setValue] = useState(email);
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      if (!change) return setChange(true);

      setIsPending(true);
      setError("");

      const [[name, value]] = [...new FormData(e.currentTarget)];

      const trimmedValue = typeof value === "string" && value.trim();
      if (!trimmedValue)
        return setError(
          language === "ja" ? "※入力してください" : "※ Please fill the field",
        );

      ///And change account info
      await updateEmail({ email: trimmedValue });

      setChange(false);
      await displayMessage(
        language === "ja"
          ? "メールアドレスが更新されました！"
          : "Email updated successfully!",
      );
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while updating email");

      console.error("Error while updating email", err.message, err.statusCode);

      const errorMessage = generateErrorMessage(language, err, "user");

      setError(
        errorMessage ||
          (language === "ja"
            ? "メールアドレス更新中にエラーが発生しました🙇‍♂️もう一度お試し下さい"
            : "Server error while updating email 🙇‍♂️ Please try again"),
      );

      await authErrorRedirect(router, err.statusCode);
    } finally {
      setIsPending(false);
    }
  }

  async function updateEmail(emailInfo: { email: string }) {
    try {
      const data = await getData("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userContext?.accessToken}`,
        },
        body: JSON.stringify(emailInfo),
      });

      setValue(data.data.email);

      //set newAccessToken for context when it's refreshed
      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err) {
      throw err;
    }
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;

    setValue(value);
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles} style={{ fontSize: smallHeaderSize }}>
        {language === "ja" ? "メールアドレス" : "Email"}
      </h3>
      {change ? (
        <>
          <input
            className={clsx(styles.input, styles.input__non_password)}
            style={{
              width: inputWidth,
              borderColor: error ? "orangered" : "#0000004f",
              fontSize,
            }}
            value={value}
            type="email"
            name="email"
            placeholder={language === "ja" ? "メールアドレス" : "email"}
            onChange={handleChangeInput}
          />
          <p
            className={styles.error}
            style={{
              color: error ? "orangered" : "rgba(255, 160, 16, 1)",
              letterSpacing: error ? "0vw" : "0.05vw",
              fontSize,
            }}
          >
            {error && error}
            {isPending && (language === "ja" ? "更新中…" : "Updating...")}
          </p>
        </>
      ) : (
        <p style={{ fontSize }}>{value}</p>
      )}
      <button
        className={styles.btn__change}
        style={{ fontSize: btnSize }}
        type="submit"
      >
        {change
          ? language === "ja"
            ? "更新"
            : "Submit"
          : language === "ja"
            ? "変更"
            : "Change"}
      </button>
    </form>
  );
}

function Password({
  router,
  language,
  userContext,
  fontSize,
  smallHeaderSize,
  inputWidth,
  btnSize,
  displayMessage,
}: {
  router: AppRouterInstance;
  language: TYPE_LANGUAGE;
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  smallHeaderSize: string;
  inputWidth: string;
  btnSize: string;
  displayMessage: (message: string) => void;
}) {
  const [change, setChange] = useState(false);
  const [errorField, setErrorField] = useState<"current" | "new" | "both" | "">(
    "",
  );
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      //When users first click the change button
      if (!change) return setChange(true);
      setIsPending(true);
      setError("");
      setErrorField("");

      //When users submit new password
      const inputDataArr = [...new FormData(e.currentTarget)];
      const [curPassword, newPassword] = inputDataArr.map(
        (dataArr) => typeof dataArr[1] === "string" && dataArr[1].trim(),
      );

      if (!curPassword || !newPassword) {
        if (!curPassword && !newPassword) setErrorField("both");

        if (!curPassword && newPassword) setErrorField("current");

        if (curPassword && !newPassword) setErrorField("new");

        return setError(
          language === "ja" ? "※入力してください" : "※ Please fill the field",
        );
      }

      if (curPassword === newPassword) {
        setErrorField("both");
        return setError(
          language === "ja"
            ? "※同じパスワードが入力されました。違うパスワードを入力して下さい"
            : "※ Same values were entered. Please enter different values.",
        );
      }

      //validate password and update
      await updatePassword({ curPassword, newPassword });

      setChange(false);
      await displayMessage(
        language === "ja"
          ? "パスワードが更新されました！"
          : "Password updated successfully!",
      );
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while updating password");

      console.error(
        "Error while updating password",
        err.message,
        err.statusCode,
      );

      const errorMessage = generateErrorMessage(language, err, "user");

      setError(
        errorMessage ||
          (language === "ja"
            ? "パスワードの更新中にエラーが発生しました🙇‍♂️もう一度お試し下さい"
            : "Server error while updating password 🙇‍♂️ Please try again"),
      );

      setErrorField(
        err.statusCode === 401 && err.name === "ValidationError"
          ? "current"
          : "new",
      );

      await authErrorRedirect(router, err.statusCode);
    } finally {
      setIsPending(false);
    }
  }

  async function updatePassword(passwordInfo: {
    curPassword: string;
    newPassword: string;
  }) {
    try {
      const data = await getData("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userContext?.accessToken}`,
        },
        body: JSON.stringify(passwordInfo),
      });

      //set newAccessToken for context when it's refreshed
      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err) {
      throw err;
    }
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles} style={{ fontSize: smallHeaderSize }}>
        {language === "ja" ? "パスワード" : "Password"}
      </h3>
      {change ? (
        <>
          <p
            style={{
              width: "90%",
              fontSize: `calc(${fontSize} * 0.95)`,
            }}
          >
            {language === "ja"
              ? `${PASSWORD_MIN_LENGTH}文字以上で、大文字、小文字、数字をそれぞれ１つずつ以上使用してください`
              : `Use more than ${PASSWORD_MIN_LENGTH} characters, including at least
            ${PASSWORD_MIN_EACH} uppercase, lowercase, and digit`}
          </p>
          <PasswordInput
            language={language}
            fontSize={fontSize}
            inputWidth={inputWidth}
            passwordType={"current"}
            errorField={errorField}
          />
          <PasswordInput
            language={language}
            fontSize={fontSize}
            inputWidth={inputWidth}
            passwordType={"new"}
            errorField={errorField}
          />
          <p
            className={styles.error}
            style={{
              color: error ? "orangered" : "rgba(255, 160, 16, 1)",
              letterSpacing: error ? "0vw" : "0.05vw",
              fontSize,
            }}
          >
            {error && error}
            {isPending && (language === "ja" ? "更新中…" : "Updating...")}
          </p>
        </>
      ) : (
        <p style={{ fontSize }}>
          {language === "ja" ? "パスワードを変更する" : "Change password"}
        </p>
      )}
      <button
        className={styles.btn__change}
        style={{ fontSize: btnSize }}
        type="submit"
      >
        {language === "ja" ? "変更" : "Change"}
      </button>
    </form>
  );
}

function PasswordInput({
  language,
  fontSize,
  inputWidth,
  passwordType,
  errorField,
}: {
  language: TYPE_LANGUAGE;
  fontSize: string;
  inputWidth: string;
  passwordType: "current" | "new";
  errorField: "current" | "new" | "both" | "";
}) {
  const [inputType, setInputType] = useState("password");

  function handleToggleVisibility() {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
  }

  const getTranslatedPlaceholder = (
    language: TYPE_LANGUAGE,
    passwordType: "current" | "new",
  ) => {
    if (language === "ja")
      return `${passwordType === "current" ? "現在の" : "新しい"}パスワード`;

    return `${
      passwordType.slice(0, 1).toUpperCase() + passwordType.slice(1)
    } password`;
  };

  return (
    <>
      <div className={styles.input_wrapper} style={{ width: inputWidth }}>
        <input
          className={styles.input}
          style={{
            width: "100%",
            height: "100%",
            borderColor:
              passwordType === errorField || errorField === "both"
                ? "orangered"
                : "#0000004f",
            fontSize,
          }}
          type={inputType}
          minLength={8}
          placeholder={getTranslatedPlaceholder(language, passwordType)}
          name={`${passwordType}Password`}
        />
        <button
          className={
            inputType === "password" ? styles.btn__eye : styles.btn__eye_off
          }
          type="button"
          onClick={handleToggleVisibility}
        ></button>
      </div>
    </>
  );
}

function Since({
  language,
  fontSize,
  smallHeaderSize,
  since,
}: {
  language: TYPE_LANGUAGE;
  fontSize: string;
  smallHeaderSize: string;
  since: string;
}) {
  const [userRegion, setUserRegion] = useState("en-US");

  useEffect(() => {
    setUserRegion(navigator.language);
  }, []);

  return (
    <div className={styles.box}>
      <h3 className={styles.titles} style={{ fontSize: smallHeaderSize }}>
        {language === "ja"
          ? "withCookingを始めた日"
          : "Using withCooking Since"}
      </h3>
      <p style={{ fontSize }}>
        {new Intl.DateTimeFormat(userRegion).format(new Date(since))}
      </p>
    </div>
  );
}

function CloseAccount({
  router,
  language,
  userContext,
  fontSize,
  smallHeaderSize,
  btnSize,
  recipes,
  toggleMessageVisible,
}: {
  router: AppRouterInstance;
  language: TYPE_LANGUAGE;
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  smallHeaderSize: string;
  btnSize: string;
  recipes: (TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK)[] | [];
  toggleMessageVisible: () => void;
}) {
  const [close, setClose] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      if (!close) return setClose(true);
      setIsPending(true);
      setError("");

      await closeAccount();
      setClose(false);
      toggleMessageVisible();
      await wait();
      toggleMessageVisible();

      //go to home page
      router.push("/");
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while closing account");

      console.error(
        "Error while closing account",
        err.message,
        err.statusCode || 500,
      );

      const errorMessage = generateErrorMessage(language, err, "user");

      setError(
        errorMessage ||
          (language === "ja"
            ? "アカウントの閉設中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while closing account 🙇‍♂️ Please try again this later"),
      );
    } finally {
      setIsPending(false);
    }
  }

  async function closeAccount() {
    try {
      const recipeIds = recipes.map((recipe) => recipe._id);

      const recipeData = await getData("/api/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: recipeIds }),
      });

      await getData("/api/users", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${userContext?.accessToken}`,
        },
      });

      //delete accessToken from context and numberOfRecipes and language prefernece from localStorage
      userContext?.logout();
    } catch (err) {
      throw err;
    }
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles} style={{ fontSize: smallHeaderSize }}>
        Close Account
      </h3>
      <p
        style={{
          width: "90%",
          letterSpacing: "0.05vw",
          color: isPending ? "rgba(255, 160, 16, 1)" : "orangered",
          fontSize,
        }}
      >
        {close && !isPending && !error && (
          <span>
            {language === "ja"
              ? "本当に退会してもよろしいですか？"
              : "Are you sure you want to close your account?"}
            <br />
            {language === "ja"
              ? "※一度退会してしまうと元に戻すことはできません！"
              : "※ Once you close your account, you cannot undo this action!"}
          </span>
        )}
        {isPending &&
          (language === "ja"
            ? "アカウントを閉設しています…"
            : "Closing your account...")}
        {error && error}
      </p>
      <button
        className={styles.btn__close}
        style={{ fontSize: btnSize }}
        type="submit"
      >
        {!close
          ? language === "ja"
            ? "退会"
            : "Close"
          : language === "ja"
            ? "はい"
            : "I'm Sure"}
      </button>
    </form>
  );
}
