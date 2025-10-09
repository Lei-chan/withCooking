"use client";
import styles from "./page.module.css";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_UPPERCASE,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_DIGIT,
} from "../lib/config";
import { getData } from "@/app/lib/helper";
import { useEffect, useState, useContext } from "react";
import { AccessTokenContext } from "../lib/providers";
import { redirect, RedirectType } from "next/navigation";

export default function Account() {
  const userContext = useContext(AccessTokenContext);
  const [data, setData] = useState<{ email: string; createdAt: string }>();

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
  const userContext = useContext(AccessTokenContext);
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

      // const newAccountInfo = { ...accountInfo };
      // newAccountInfo.email = value;
      // console.log(value);
      ///And change account info
      await updateEmail({ email: trimmedValue });

      setChange(false);
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
          <p
            className={styles.error}
            style={{
              color: error ? "orangered" : "rgba(255, 160, 16, 1)",
              letterSpacing: error ? "0vw" : "0.05vw",
            }}
          >
            {error ? error : ""}
            {isPending ? "Updating..." : ""}
          </p>
        </>
      ) : (
        <p className={styles.content}>{value}</p>
      )}
      <button className={styles.btn__change} type="submit">
        {change ? "Submit" : "Change"}
      </button>
    </form>
  );
}

function Password() {
  const userContext = useContext(AccessTokenContext);
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
          <p
            className={styles.error}
            style={{
              color: error ? "orangered" : "rgba(255, 160, 16, 1)",
              letterSpacing: error ? "0vw" : "0.05vw",
            }}
          >
            {error ? error : ""}
            {isPending ? "Updating..." : ""}
          </p>
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
  errorField: "current" | "new" | "both" | "";
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
            fontSize: "1.2vw",
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
  const userContext = useContext(AccessTokenContext);
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
      <h3 className={styles.titles}>Close Account</h3>
      <p
        style={{
          fontSize: "1.2vw",
          letterSpacing: "0.05vw",
          color: isPending ? "rgba(255, 160, 16, 1)" : "orangered",
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
      <button className={styles.btn__close} type="submit">
        {!close ? "Close" : "I'm sure"}
      </button>
    </form>
  );
}
