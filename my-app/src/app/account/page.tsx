"use client";
import styles from "./page.module.css";
import {
  accountInfo,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_UPPERCASE,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_DIGIT,
} from "../config";
import { getData, validatePassword } from "../helper";
import { useEffect, useState } from "react";

export default function Account() {
  const [data, setData] = useState<{ email: string; createdAt: string }>();

  console.log(data);
  async function getUser() {
    try {
      const data = await getData("/api/users", { method: "GET" });

      setData(data.data);
    } catch (err: any) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    (async () => await getUser())();
  }, []);

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
        padding: "2%",
        overflowX: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "2.1vw",
          letterSpacing: "0.1vw",
          wordSpacing: "0.3vw",
          color: "#0d0081ff",
        }}
      >
        Account Information
      </h1>
      {!data && (
        <div
          className={styles.loading}
          style={{
            backgroundColor: "#fffdcdff",
            width: "40%",
            minHeight: "500px",
            marginTop: "1.8%",
            borderRadius: "1.1%/1.4%",
          }}
        ></div>
      )}
      {data && (
        <div
          style={{
            backgroundImage: "linear-gradient(#fffedbff, #fffdcdff)",
            width: "40%",
            minHeight: "500px",
            height: "fit-content",
            marginTop: "1.8%",
            borderRadius: "1.1%/1.4%",
            boxShadow: "#0000007c 3px 3px 10px",
            padding: "1% 0",
          }}
        >
          <Email email={data.email} />
          <Password />
          <Since since={data.createdAt} />
          <CloseAccount />
        </div>
      )}
    </div>
  );
}

function Email({ email }: { email: string }) {
  const [change, setChange] = useState(false);
  const [value, setValue] = useState(email);
  const [error, setError] = useState<string>();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!change) return setChange(true);

    const [[name, value]] = [...new FormData(e.currentTarget)];

    const trimmedValue = typeof value === "string" && value.trim();
    if (!trimmedValue) return setError("※ Please fill the field");

    if (trimmedValue === accountInfo.email)
      return setError(
        "※Please enter different email from the one you registered."
      );

    // const newAccountInfo = { ...accountInfo };
    // newAccountInfo.email = value;
    // console.log(value);
    ///And change account info
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;

    setValue(value);
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles}>Email</h3>
      {change ? (
        <>
          <input
            className={styles.input}
            style={{ borderColor: error ? "orangered" : "#0000004f" }}
            value={value}
            type="email"
            name="email"
            onChange={handleChangeInput}
          />
          <p className={styles.error}>{error}</p>
        </>
      ) : (
        <p className={styles.content}>{email}</p>
      )}
      <button className={styles.btn__change} type="submit">
        {change ? "Submit" : "Change"}
      </button>
    </form>
  );
}

function Password() {
  const [change, setChange] = useState(false);
  const [errorField, setErrorField] = useState<"current" | "new" | "both">();
  const [error, setError] = useState<string>();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //When users first click the change button
    if (!change) return setChange(true);

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
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles}>Password</h3>
      {change ? (
        <>
          <p style={{ fontSize: "1.2vw" }}>
            Use more than {PASSWORD_MIN_LENGTH} characters, including at least
            <br />
            {PASSWORD_MIN_UPPERCASE} uppercase, {PASSWORD_MIN_LOWERCASE}{" "}
            lowercase, and {PASSWORD_MIN_DIGIT} digit
          </p>
          <PasswordInput passwordType={"current"} errorField={errorField} />
          <PasswordInput passwordType={"new"} errorField={errorField} />
          <p className={styles.error}>{error}</p>
        </>
      ) : (
        <p style={{ fontSize: "1.2vw" }}>Change password from here</p>
      )}
      <button className={styles.btn__change} type="submit">
        Change
      </button>
    </form>
  );
}

function PasswordInput({
  passwordType,
  errorField,
}: {
  passwordType: "current" | "new";
  errorField: "current" | "new" | "both" | undefined;
}) {
  const [inputType, setInputType] = useState("password");

  function handleToggleVisibility() {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
  }

  return (
    <>
      <div className={styles.input_wrapper}>
        <input
          style={{
            width: "100%",
            height: "100%",
            borderColor:
              passwordType === errorField || errorField === "both"
                ? "orangered"
                : "#0000004f",
          }}
          className={styles.input}
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

function Since({ since }: { since: string }) {
  return (
    <div className={styles.box}>
      <h3 className={styles.titles}>Using withCooking Since</h3>
      <p className={styles.content}>
        {new Intl.DateTimeFormat(navigator.language).format(new Date(since))}
      </p>
    </div>
  );
}

function CloseAccount() {
  const [close, setClose] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!close) return setClose(true);
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <h3 className={styles.titles}>Close Account</h3>
      {close && (
        <p
          style={{
            fontSize: "1.2vw",
            letterSpacing: "0.05vw",
            color: "orangered",
          }}
        >
          Are you sure you want to close your account? <br />
          ※Once you close account, you can not go back!
        </p>
      )}
      <button className={styles.btn__close} type="submit">
        {!close ? "Close" : "I'm sure"}
      </button>
    </form>
  );
}
