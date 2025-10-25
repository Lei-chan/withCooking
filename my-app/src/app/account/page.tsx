"use client";
import styles from "./page.module.css";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_UPPERCASE,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_DIGIT,
  TYPE_USER_CONTEXT,
} from "../lib/config";
import { getData, wait } from "@/app/lib/helper";
import { useEffect, useState, useContext } from "react";
import { MediaContext, UserContext } from "../lib/providers";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";

export default function Account() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  const [data, setData] = useState<{ email: string; createdAt: string }>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  console.log(mediaContext);

  //design
  const formWidth =
    mediaContext === "mobile"
      ? "84%"
      : mediaContext === "tablet"
      ? "60%"
      : "40%";
  const fontSize =
    mediaContext === "mobile"
      ? "4.7vw"
      : mediaContext === "tablet"
      ? "3vw"
      : mediaContext === "desktop"
      ? "1.7vw"
      : "1.4vw";
  const smallHeaderSize = `calc(${fontSize} * 1.1)`;
  const inputWidth = mediaContext === "mobile" ? "80%" : "55%";
  const btnSize = `calc(${fontSize} * 0.9)`;

  async function getUser() {
    try {
      const data = await getData("/api/users", {
        method: "GET",
        headers: {
          authorization: `Bearer ${userContext?.accessToken}`,
        },
      });

      setData(data.data);

      //set newAccessToken for context when it's refreshed
      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err: any) {
      console.error("Error while getting user information", err.message);
      setError("Server error 🙇‍♂️ Please try again!");
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
        padding: "2% 0 5% 0",
        overflowX: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: `calc(${fontSize} * 1.3)`,
          letterSpacing: "0.1vw",
          wordSpacing: "0.3vw",
          margin: fontSize,
          color: "#0d0081ff",
        }}
      >
        Account Information
      </h1>
      {(error || message) && (
        <p
          style={{
            width: formWidth,
            backgroundColor: error ? "orangered" : "#68e204ff",
            padding: "1% 3%",
            borderRadius: "2% / 19%",
            color: "white",
            fontSize,
            letterSpacing: "0.07vw",
          }}
        >
          {error || message}
        </p>
      )}
      {!data && (
        <div
          style={{
            backgroundColor: "#fffdcdff",
            width: formWidth,
            aspectRatio: "1/0.7",
            marginTop: "2%",
            borderRadius: "1.1%/1.4%",
          }}
          className={styles.loading}
        ></div>
      )}
      {data && (
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
            userContext={userContext}
            fontSize={fontSize}
            smallHeaderSize={smallHeaderSize}
            inputWidth={inputWidth}
            btnSize={btnSize}
            email={data.email}
            displayMessage={displayMessage}
          />
          <Password
            userContext={userContext}
            fontSize={fontSize}
            smallHeaderSize={smallHeaderSize}
            inputWidth={inputWidth}
            btnSize={btnSize}
            displayMessage={displayMessage}
          />
          <Since
            fontSize={fontSize}
            smallHeaderSize={smallHeaderSize}
            since={data.createdAt}
          />
          <CloseAccount
            userContext={userContext}
            fontSize={fontSize}
            smallHeaderSize={smallHeaderSize}
            btnSize={btnSize}
            displayMessage={displayMessage}
          />
        </div>
      )}
    </div>
  );
}

function Email({
  userContext,
  fontSize,
  smallHeaderSize,
  inputWidth,
  btnSize,
  email,
  displayMessage,
}: {
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
      if (!trimmedValue) return setError("※ Please fill the field");

      ///And change account info
      await updateEmail({ email: trimmedValue });

      setChange(false);
      await displayMessage("Email updated successfully!");
    } catch (err: any) {
      setError(`※${err.message}`);
      console.error(
        "Error while updating email",
        err.message,
        err.statusCode || ""
      );
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

      console.log(data);
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
        Email
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
            {error ? error : ""}
            {isPending ? "Updating..." : ""}
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
        {change ? "Submit" : "Change"}
      </button>
    </form>
  );
}

function Password({
  userContext,
  fontSize,
  smallHeaderSize,
  inputWidth,
  btnSize,
  displayMessage,
}: {
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  smallHeaderSize: string;
  inputWidth: string;
  btnSize: string;
  displayMessage: (message: string) => void;
}) {
  const [change, setChange] = useState(false);
  const [errorField, setErrorField] = useState<"current" | "new" | "both" | "">(
    ""
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
        (dataArr) => typeof dataArr[1] === "string" && dataArr[1].trim()
      );

      if (!curPassword && !newPassword) {
        setErrorField("both");
        return setError("※ Please fill the field");
      }

      if (!curPassword) {
        setErrorField("current");
        return setError("※ Please fill the field");
      }

      if (!newPassword) {
        setErrorField("new");
        return setError("※ Please fill the field");
      }

      if (curPassword === newPassword) {
        setErrorField("both");
        return setError(
          "※Same values were entered. Please enter different values."
        );
      }

      //validate password and update
      await updatePassword({ curPassword, newPassword });

      setChange(false);
      await displayMessage("Password updated successfully!");
    } catch (err: any) {
      setError(err.message);
      setErrorField(err.statusCode === 401 ? "current" : "new");
      console.error(
        "Error while updating password",
        err.message,
        err.statusCode || ""
      );
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

      console.log(data);
      //set newAccessToken for context when it's refreshed
      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err) {
      throw err;
    }
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles} style={{ fontSize: smallHeaderSize }}>
        Password
      </h3>
      {change ? (
        <>
          <p
            style={{
              width: "90%",
              fontSize: `calc(${fontSize} * 0.95)`,
              // backgroundColor: "blue",
            }}
          >
            Use more than {PASSWORD_MIN_LENGTH} characters, including at least
            <br />
            {PASSWORD_MIN_UPPERCASE} uppercase, {PASSWORD_MIN_LOWERCASE}{" "}
            lowercase, and {PASSWORD_MIN_DIGIT} digit
          </p>
          <PasswordInput
            fontSize={fontSize}
            inputWidth={inputWidth}
            passwordType={"current"}
            errorField={errorField}
          />
          <PasswordInput
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
            {error ? error : ""}
            {isPending ? "Updating..." : ""}
          </p>
        </>
      ) : (
        <p style={{ fontSize }}>Change password from here</p>
      )}
      <button
        className={styles.btn__change}
        style={{ fontSize: btnSize }}
        type="submit"
      >
        Change
      </button>
    </form>
  );
}

function PasswordInput({
  fontSize,
  inputWidth,
  passwordType,
  errorField,
}: {
  fontSize: string;
  inputWidth: string;
  passwordType: "current" | "new";
  errorField: "current" | "new" | "both" | "";
}) {
  const [inputType, setInputType] = useState("password");

  function handleToggleVisibility() {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
  }

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
          placeholder={`${passwordType} password`}
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
  fontSize,
  smallHeaderSize,
  since,
}: {
  fontSize: string;
  smallHeaderSize: string;
  since: string;
}) {
  return (
    <div className={styles.box}>
      <h3 className={styles.titles} style={{ fontSize: smallHeaderSize }}>
        Using withCooking Since
      </h3>
      <p style={{ fontSize }}>
        {new Intl.DateTimeFormat(navigator.language).format(new Date(since))}
      </p>
    </div>
  );
}

function CloseAccount({
  userContext,
  fontSize,
  smallHeaderSize,
  btnSize,
  displayMessage,
}: {
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  smallHeaderSize: string;
  btnSize: string;
  displayMessage: (message: string) => void;
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
      await displayMessage(
        "Thank you for using this app :) I hope to see you again!"
      );
    } catch (err: any) {
      setError(err.message);
      return console.error(
        "Error while closing account",
        err.message,
        err.statusCode || ""
      );
    } finally {
      setIsPending(false);
    }

    redirect("/", RedirectType.replace);
  }

  async function closeAccount() {
    try {
      const data = await getData("/api/users", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${userContext?.accessToken}`,
        },
      });
      console.log(data);

      //delete accessToken from context
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
            Are you sure you want to close your account? <br /> ※Once you close
            account, you can not go back!
          </span>
        )}
        {isPending && "Closing your account..."}
        {error && error}
      </p>
      <button
        className={styles.btn__close}
        style={{ fontSize: btnSize }}
        type="submit"
      >
        {!close ? "Close" : "I'm sure"}
      </button>
    </form>
  );
}
