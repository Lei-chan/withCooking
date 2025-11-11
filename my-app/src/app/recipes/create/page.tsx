"use client";
//react
import React, { useContext, useEffect, useState } from "react";
//css
import styles from "./page.module.css";
//componets
import { RecipeEdit } from "@/app/lib/components/components";
import { LanguageContext, MediaContext } from "@/app/lib/providers";
import { getFontSizeForLanguage } from "@/app/lib/helpers/other";
import { TYPE_LANGUAGE } from "@/app/lib/config/type";

export default function CreateRecipe() {
  //language
  const languageContext = useContext(LanguageContext);

  const [language, setLanguage] = useState<TYPE_LANGUAGE>("en");

  useEffect(() => {
    if (!languageContext?.language) return;
    setLanguage(languageContext.language);
  }, [languageContext?.language]);

  //design
  const mediaContext = useContext(MediaContext);

  const [fontSize, setFontSize] = useState("1.5vw");
  const [btnStyle, setBtnStyle] = useState<object>();
  const [smallHeaderSize, setSmallHeaderSize] = useState(
    `calc(${fontSize} * 1.2)`
  );

  useEffect(() => {
    if (!mediaContext) return;

    const fontSizeEn =
      mediaContext === "mobile"
        ? "4.7vw"
        : mediaContext === "tablet"
        ? "2.7vw"
        : mediaContext === "desktop"
        ? "1.5vw"
        : "1.3vw";

    const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
    setFontSize(fontSizeFinal);

    setBtnStyle({
      fontSize: fontSizeFinal,
      width:
        mediaContext === "mobile"
          ? "35%"
          : mediaContext === "tablet"
          ? "20%"
          : "15%",
    });

    setSmallHeaderSize(`calc(${fontSizeFinal} * 1.2)`);
  }, [mediaContext, language]);

  type CreateFrom = "scratch" | "link" | null;
  const [createFrom, setCreateFrom] = useState<CreateFrom>(null);

  //for create from link
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  function handleClickFrom(e: React.MouseEvent<HTMLButtonElement>) {
    const targetName = e.currentTarget.name;
    console.log(targetName);
    setCreateFrom(targetName as CreateFrom);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const link = String(formData.get("link")).trim();
    const name = String(formData.get("name")).trim();
    const favorite = formData.get("favorite");

    //validate link
    const isValidLink = URL.canParse(link);

    if (!isValidLink)
      return setError(
        language === "ja"
          ? "有効なリンクを入力して下さい"
          : "Please enter valid link"
      );

    if (!name)
      return setError(
        language === "ja"
          ? "レシピの名前を入力してください"
          : "Please enter the recipe name"
      );

    const newRecipeFromLink = {
      title: name,
      link,
      favorite: favorite === "on" ? true : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(newRecipeFromLink);

    //send recipe
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundImage:
          "linear-gradient(rgba(255, 241, 117, 1), rgba(255, 190, 117, 1))",
        width: "100vw",
        minHeight: "100vh",
        maxHeight: "fit-content",
        padding: "2% 0",
      }}
    >
      {!createFrom && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
            padding: "0 5%",
            gap:
              mediaContext === "mobile" || mediaContext === "tablet"
                ? "10vh"
                : "13vh",
          }}
        >
          <h2
            style={{
              fontSize: `calc(${fontSize} * 1.7)
          `,
              color: "brown",
            }}
          >
            {language === "ja"
              ? "どのようにレシピを作りますか？"
              : "How do you want to create a recipe?"}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "fit-content",
              gap: mediaContext === "mobile" ? "10%" : "15%",
            }}
          >
            <button
              className={styles.btn__scratch}
              style={btnStyle}
              name="scratch"
              onClick={handleClickFrom}
            >
              {language === "ja" ? "始めから" : "From scratch"}
            </button>
            <button
              className={styles.btn__link}
              style={btnStyle}
              name="link"
              onClick={handleClickFrom}
            >
              {language === "ja" ? "外部リンクから" : "From external link"}
            </button>
          </div>
        </div>
      )}
      {createFrom === "scratch" && (
        <RecipeEdit
          recipe={{
            favorite: false,
            mainImage: undefined,
            mainImagePreview: undefined,
            title: "",
            author: "",
            servings: { servings: 0, unit: "", customUnit: "" },
            temperatures: { temperatures: [], unit: "℉" },
            ingredients: [
              {
                ingredient: "",
                amount: 0,
                unit: "g",
                id: undefined,
                convertion: {
                  original: { amount: 0, unit: "g" },
                  metric: undefined,
                  us: undefined,
                  japan: undefined,
                  australia: undefined,
                  metricCup: undefined,
                  g: undefined,
                  kg: undefined,
                  oz: undefined,
                  lb: undefined,
                  ml: undefined,
                  L: undefined,
                  usCup: undefined,
                  japaneseCup: undefined,
                  imperialCup: undefined,
                  riceCup: undefined,
                  tsp: undefined,
                  tbsp: undefined,
                  australianTbsp: undefined,
                },
              },
            ],
            preparation: "",
            instructions: [
              {
                instruction: "",
                image: undefined,
              },
            ],
            description: "",
            memoryImages: [],
            comments: "",
          }}
          error=""
          createOrUpdate="create"
        />
      )}
      {createFrom === "link" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
          }}
        >
          {(error || message || isPending) && (
            <p
              style={{
                fontSize: `calc(${fontSize} * 1.1)`,
                backgroundColor: error
                  ? "orangered"
                  : message
                  ? "rgba(10, 231, 39, 1)"
                  : "rgba(109, 221, 127, 1)",
                color: "white",
                borderRadius: "5px",
                padding: "1% 2%",
                width:
                  mediaContext === "mobile"
                    ? "90%"
                    : mediaContext === "tablet"
                    ? "70%"
                    : mediaContext === "desktop"
                    ? "50%"
                    : "40%",
                marginBottom:
                  mediaContext === "mobile"
                    ? "3%"
                    : mediaContext === "tablet"
                    ? "2%"
                    : "1%",
              }}
            >
              {error ||
                message ||
                (language === "ja" ? "レシピを作成中…" : "Creating recipe...")}
            </p>
          )}
          <form
            style={{
              width:
                mediaContext === "mobile"
                  ? "90%"
                  : mediaContext === "tablet"
                  ? "70%"
                  : mediaContext === "desktop"
                  ? "50%"
                  : "40%",
              height: "fit-content",
              backgroundColor: "rgba(250, 255, 207, 1)",
              borderRadius: "5px",
              boxShadow: "rgba(0, 0, 0, 0.29) 3px 3px 10px",
              padding: `${smallHeaderSize} 2%`,
              letterSpacing: language !== "ja" ? "1px" : "0",
            }}
            onSubmit={handleSubmit}
          >
            <div>
              <h5
                style={{
                  fontSize: smallHeaderSize,
                  marginBottom: fontSize,
                }}
              >
                {language === "ja"
                  ? "レシピのリンクを入力してください"
                  : "Enter recipe link"}
              </h5>
              <input
                style={{
                  fontSize,
                  marginBottom: smallHeaderSize,
                  width: "70%",
                  padding: "0.5%",
                  letterSpacing: language !== "ja" ? "0.5px" : "0",
                }}
                type="url"
                name="link"
                placeholder={
                  language === "ja" ? "レシピのリンク" : "recipe link"
                }
                required
              ></input>
            </div>
            <div>
              <h5
                style={{
                  fontSize: smallHeaderSize,
                  marginBottom: fontSize,
                }}
              >
                {language === "ja"
                  ? "レシピの名前を入力してください"
                  : "Enter recipe name"}
              </h5>
              <input
                style={{
                  fontSize,
                  marginBottom: smallHeaderSize,
                  width: "70%",
                  padding: "0.5%",
                  letterSpacing: language !== "ja" ? "0.5px" : "0",
                }}
                name="name"
                placeholder={language === "ja" ? "レシピの名前" : "recipe name"}
                required
              ></input>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: smallHeaderSize,
                height: "fit-content",
                gap: "2%",
              }}
            >
              <span style={{ fontSize }}>
                {language === "ja"
                  ? "お気に入りとして登録する"
                  : "Save this recipe as favorite"}
              </span>
              <input
                style={{ width: smallHeaderSize, height: smallHeaderSize }}
                type="checkbox"
                name="favorite"
              ></input>
            </div>
            <button
              className={styles.btn__upload}
              style={{
                fontSize,
                letterSpacing: language !== "ja" ? "1px" : "0",
              }}
              type="submit"
            >
              {language === "ja" ? "アップロード" : "Upload"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
