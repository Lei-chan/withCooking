"use client";
//react
import clsx from "clsx";
//next.js
import Image from "next/image";
import { useRouter } from "next/navigation";
//css
import styles from "./recipeCommon.module.css";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";
//method for recipe
import { handleClickEdit } from "../../helpers/recipes";

export function ErrorMessageRecipe({
  mediaContext,
  fontSize,
  error,
  message,
  mainOrRecipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  error: string;
  message: string;
  mainOrRecipe: "main" | "recipe";
}) {
  return (
    <p
      style={{
        backgroundColor: error ? "orangered" : "rgba(112, 231, 0, 1)",
        color: "white",
        padding:
          mainOrRecipe === "main"
            ? "0.7% 1%"
            : mediaContext === "mobile"
            ? "1.5% 2%"
            : "0.7% 1%",
        borderRadius: "5px",
        fontSize: `calc(${fontSize} * ${mainOrRecipe === "main" ? 0.9 : 1.1})`,
        letterSpacing: "0.07vw",
        marginBottom: mediaContext === "mobile" ? "2%" : "1%",
      }}
    >
      {error || message}
    </p>
  );
}

export function BtnFavorite({
  mediaContext,
  favorite,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  favorite: boolean;
  onClickFavorite: () => void;
}) {
  return (
    <button
      style={{
        background: "none",
        backgroundImage: !favorite
          ? 'url("/icons/star-off.png")'
          : 'url("/icons/star-on.png")',
        width:
          mediaContext === "mobile"
            ? "7%"
            : mediaContext === "tablet"
            ? "5.5%"
            : "4.5%",
        aspectRatio: "1",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100%",
        border: "none",
      }}
      type="button"
      onClick={onClickFavorite}
    ></button>
  );
}

export function ButtonEditMain({
  mediaContext,
  language,
  fontSize,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
}) {
  const router = useRouter();

  return (
    <button
      className={clsx(styles.btn__img, styles.btn__edit)}
      style={{
        color: "blueviolet",
        backgroundImage: "url(/icons/pencile.svg)",
        width:
          mediaContext === "mobile" || mediaContext === "tablet"
            ? "20%"
            : "15%",
        height: "fit-content",
        top: mediaContext === "mobile" ? "0.2%" : "0.4%",
        right: mediaContext === "mobile" ? "10%" : "5%",
        fontSize,
      }}
      type="button"
      onClick={() => handleClickEdit(router)}
    >
      {language === "ja" ? "編集" : "Edit"}
    </button>
  );
}

export function LoadingRecipe({ mediaContext }: { mediaContext: TYPE_MEDIA }) {
  return (
    <form
      className={styles.loading}
      style={{
        backgroundImage:
          "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
        width:
          mediaContext === "mobile"
            ? "90dvw"
            : mediaContext === "tablet"
            ? "70dvw"
            : "50dvw",
        aspectRatio: "1/1.5",
        boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
        borderRadius: mediaContext === "mobile" ? "5px" : "10px",
      }}
    ></form>
  );
}

export function Loading({
  language,
  mediaContext,
  message,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  message: string;
}) {
  //design
  const imageSize =
    mediaContext === "mobile"
      ? 100
      : mediaContext === "tablet"
      ? 130
      : mediaContext === "desktop"
      ? 150
      : 180;

  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 174, 0, 1)",
        zIndex: "100",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "15%",
          width: "40%",
          height: "40%",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize:
              mediaContext === "mobile"
                ? "5vw"
                : mediaContext === "tablet"
                ? "2.7vw"
                : mediaContext === "desktop"
                ? "1.8vw"
                : "1.5vw",
            letterSpacing: "0.08vw",
            textAlign: "center",
          }}
        >
          {message}
        </p>
        <Image
          className={styles.img__uploading}
          src="/icons/loading.png"
          alt={language === "ja" ? "アイコンロード中" : "loading icon"}
          width={imageSize}
          height={imageSize}
          priority
        ></Image>
      </div>
    </div>
  );
}
