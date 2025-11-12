"use client";
//react
import React, { useEffect, useState, useContext } from "react";
import clsx from "clsx";
//css
import styles from "./page.module.css";
//type
import {
  TYPE_LANGUAGE,
  TYPE_RECIPE,
  TYPE_RECIPE_LINK,
} from "@/app/lib/config/type";
//general methods
import { getData, getSize } from "@/app/lib/helpers/other";
//context
import {
  LanguageContext,
  MediaContext,
  UserContext,
} from "@/app/lib/providers";
//components
import {
  Loading,
  LoadingRecipe,
  RecipeEdit,
  RecipeLinkEdit,
  RecipeLinkNoEdit,
  RecipeNoEdit,
} from "@/app/lib/components/components";

export default function Recipe() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);

  //language
  const languageContext = useContext(LanguageContext);

  const [language, setLanguage] = useState<TYPE_LANGUAGE>("en");

  useEffect(() => {
    if (!languageContext?.language) return;

    setLanguage(languageContext.language);
  }, [languageContext?.language]);

  //design
  const [recipeWidth, setRecipeWidth] = useState("50%");
  const [iframeHeight, setIframeHeight] = useState(400);
  const [fontSize, setFontSize] = useState("1.3vw");

  useEffect(() => {
    if (!mediaContext) return;

    const width =
      window.innerWidth *
        (mediaContext === "mobile"
          ? 0.9
          : mediaContext === "tablet"
          ? 0.7
          : 0.5) +
      "px";

    setRecipeWidth(width);

    const height = window.innerHeight * 0.8;
    setIframeHeight(height);

    const fontSizeEn =
      mediaContext === "mobile"
        ? getSize(width, 0.045, "4.5vw")
        : mediaContext === "tablet"
        ? getSize(width, 0.034, "2.7vw")
        : mediaContext === "desktop" && window.innerWidth <= 1100
        ? getSize(width, 0.031, "1.5vw")
        : getSize(width, 0.028, "1.3vw");

    setFontSize(
      language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn
    );
  }, [mediaContext, language]);

  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE | TYPE_RECIPE_LINK>();
  const [edit, setEdit] = useState(false);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    (async () => await getRecipe(id))();
  }, [edit]);

  async function getRecipe(id: string) {
    try {
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      setRecipe(data.data);
    } catch (err: any) {
      err.statusCode === 404
        ? setError(
            language === "ja" ? "レシピが見つかりません！" : "Recipe not found!"
          )
        : setError(
            language === "ja"
              ? "レシピのロード中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
              : "Server error while loading recipe 🙇‍♂️ Please try again"
          );
      console.error(
        "Error while loading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  function handleToggleEdit() {
    setError("");
    setEdit(!edit);
  }

  return !isPending ? (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundImage:
          "linear-gradient(rgba(255, 253, 117, 1), rgba(225, 255, 117, 1))",
        width: "100%",
        height: "fit-content",
        padding:
          mediaContext === "mobile"
            ? "15% 0 5% 0"
            : mediaContext === "tablet"
            ? "10% 0 5% 0"
            : "2% 0",
      }}
    >
      {!recipe ? (
        <LoadingRecipe mediaContext={mediaContext} recipeWidth={recipeWidth} />
      ) : (
        <>
          {edit ? (
            <>
              <button
                className={clsx(styles.btn__img, styles.btn__edit)}
                style={{
                  color: "blueviolet",
                  backgroundImage: "url(/icons/recipes.svg)",
                  width:
                    mediaContext === "mobile"
                      ? "30%"
                      : mediaContext === "tablet"
                      ? "17%"
                      : mediaContext === "desktop"
                      ? "11.5%"
                      : "10.5%",
                  top:
                    mediaContext === "mobile" || mediaContext === "tablet"
                      ? "1%"
                      : "2%",
                  right:
                    mediaContext === "mobile"
                      ? "7%"
                      : mediaContext === "tablet"
                      ? "15%"
                      : "7%",
                  fontSize: `calc(${fontSize} * ${
                    mediaContext === "mobile" ? 1.4 : 1.3
                  })`,
                }}
                onClick={handleToggleEdit}
              >
                {language === "ja" ? "レシピ" : "Recipe"}
              </button>
              {"link" in recipe ? (
                <RecipeLinkEdit
                  recipe={recipe}
                  createOrEdit="edit"
                  handleChangeEdit={handleToggleEdit}
                />
              ) : (
                <RecipeEdit
                  recipe={recipe}
                  error={error}
                  createOrUpdate="update"
                  handleChangeEdit={handleToggleEdit}
                />
              )}
            </>
          ) : (
            <>
              <button
                className={clsx(styles.btn__img, styles.btn__edit)}
                style={{
                  color: "blueviolet",
                  backgroundImage: "url(/icons/pencile.svg)",
                  width:
                    mediaContext === "mobile"
                      ? "20%"
                      : mediaContext === "tablet"
                      ? "13%"
                      : "10%",
                  top:
                    mediaContext === "mobile" || mediaContext === "tablet"
                      ? "1%"
                      : "2%",
                  right:
                    mediaContext === "mobile"
                      ? "10%"
                      : mediaContext === "tablet"
                      ? "15%"
                      : "10%",
                  fontSize: `calc(${fontSize} * ${
                    mediaContext === "mobile" ? 1.5 : 1.4
                  })`,
                }}
                type="button"
                onClick={handleToggleEdit}
              >
                {language === "ja" ? "編集" : "Edit"}
              </button>
              {"link" in recipe ? (
                <RecipeLinkNoEdit
                  recipeWidth={parseFloat(recipeWidth)}
                  recipeHeight={iframeHeight}
                  recipe={recipe}
                  mainOrRecipe="recipe"
                />
              ) : (
                <RecipeNoEdit
                  mediaContext={mediaContext}
                  userContext={userContext}
                  recipeWidth={recipeWidth}
                  error={error}
                  mainOrRecipe="recipe"
                  userRecipe={recipe}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  ) : (
    <Loading
      message={
        language === "ja" ? "レシピを更新中…" : "Updating your recipe..."
      }
    />
  );
}
