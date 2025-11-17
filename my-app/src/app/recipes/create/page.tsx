"use client";
//react
import React, { useContext, useState } from "react";
//css
import styles from "./page.module.css";
//context
import { LanguageContext, MediaContext } from "@/app/lib/providers";
//componets
import { RecipeEdit, RecipeLinkEdit } from "@/app/lib/components/components";
//general method
import { getFontSizeForLanguage } from "@/app/lib/helpers/other";

export default function CreateRecipe() {
  //language
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "en";

  //design
  const mediaContext = useContext(MediaContext);
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.7vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : mediaContext === "desktop"
      ? "1.5vw"
      : "1.3vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
  const btnStyle = {
    fontSize: fontSizeFinal,
    width:
      mediaContext === "mobile"
        ? "35%"
        : mediaContext === "tablet"
        ? "20%"
        : "15%",
  };

  type CreateFrom = "scratch" | "link" | null;
  const [createFrom, setCreateFrom] = useState<CreateFrom>(null);

  function handleClickFrom(e: React.MouseEvent<HTMLButtonElement>) {
    const targetName = e.currentTarget.name;
    setCreateFrom(targetName as CreateFrom);
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
        width: "100%",
        // minHeight: "100dvh",
        height: "100%",
      }}
    >
      {!createFrom && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            height: "100dvh",
            padding: "0 5%",
            gap:
              mediaContext === "mobile" || mediaContext === "tablet"
                ? "10vh"
                : "13vh",
          }}
        >
          <h2
            style={{
              fontSize: `calc(${fontSizeFinal} * 1.7)
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
              {language === "ja" ? "はじめから" : "From Scratch"}
            </button>
            <button
              className={styles.btn__link}
              style={btnStyle}
              name="link"
              onClick={handleClickFrom}
            >
              {language === "ja" ? "外部のリンクから" : "From an External Link"}
            </button>
          </div>
        </div>
      )}
      {createFrom === "scratch" && (
        <RecipeEdit
          language={language}
          mediaContext={mediaContext}
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
            createdAt: "",
            updatedAt: "",
          }}
          error=""
          createOrUpdate="create"
        />
      )}
      {createFrom === "link" && (
        <RecipeLinkEdit
          language={language}
          mediaContext={mediaContext}
          recipe={{
            title: "",
            favorite: false,
            link: "",
            createdAt: "",
            updatedAt: "",
          }}
          createOrEdit="create"
        />
      )}
    </div>
  );
}
