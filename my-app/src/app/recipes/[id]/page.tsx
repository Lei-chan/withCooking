"use client";
//react
import { useEffect, useState, useContext } from "react";
import clsx from "clsx";
//next.js
import Link from "next/link";
import { useParams } from "next/navigation";
//css
import styles from "./page.module.css";
//context
import {
  LanguageContext,
  MediaContext,
  UserContext,
} from "@/app/lib/providers";
//components
import {
  LoadingRecipe,
  RecipeEdit,
  RecipeLinkEdit,
  RecipeLinkNoEdit,
  RecipeNoEdit,
} from "@/app/lib/components/components";
//type
import {
  TYPE_LANGUAGE,
  TYPE_RECIPE,
  TYPE_RECIPE_LINK,
} from "@/app/lib/config/type";
//general methods
import {
  generateErrorMessage,
  getData,
  getSize,
  isApiError,
  logNonApiError,
} from "@/app/lib/helpers/other";
import { handler } from "next/dist/build/templates/app-route";

export default function Recipe() {
  const params = useParams<{ id: string }>();
  const userContext = useContext(UserContext);

  //language
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "en";

  //design
  const mediaContext = useContext(MediaContext);
  const [windowWidth, setWindowWidth] = useState(1220);
  const [windowHeight, setWindowHeight] = useState(600);
  const recipeWidth =
    windowWidth *
      (mediaContext === "mobile"
        ? 0.9
        : mediaContext === "tablet"
        ? 0.7
        : 0.5) +
    "px";
  const iframeHeight = windowHeight * 0.8;
  const fontSizeEn =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.045, "4.5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.034, "2.7vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(recipeWidth, 0.031, "1.5vw")
      : getSize(recipeWidth, 0.028, "1.3vw");
  const fontSizeFinal =
    language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE | TYPE_RECIPE_LINK>();
  const [edit, setEdit] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    (async () => await getRecipe(params.id))();
  }, [edit]);

  async function getRecipe(id: string) {
    try {
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      setRecipe(data.data);
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while loading recipe");

      console.error(
        "Error while loading recipe",
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "recipe");

      setError(
        errorMessage ||
          (language === "ja"
            ? "レシピのロード中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while loading recipe 🙇‍♂️ Please try again")
      );
    }
  }

  function handleToggleEdit() {
    setError("");
    setEdit(!edit);
  }

  return (
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
        minHeight: "100vh",
        maxHeight: "fit-content",
        padding:
          mediaContext === "mobile"
            ? "15% 0 5% 0"
            : mediaContext === "tablet"
            ? "10% 0 5% 0"
            : "2% 0",
      }}
    >
      {!recipe && !error && (
        <LoadingRecipe mediaContext={mediaContext} recipeWidth={recipeWidth} />
      )}
      {!recipe && error && (
        <div>
          <h1
            className={styles.no_content}
            style={{
              fontSize: `calc(${fontSizeFinal} * 2.5)`,
            }}
          >
            {error}
          </h1>
          <Link href="/recipes">
            {language === "ja"
              ? "レシピまとめページに戻る"
              : "Return Recipes Page"}
          </Link>
        </div>
      )}
      {recipe && edit && (
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
              fontSize: `calc(${fontSizeFinal} * ${
                mediaContext === "mobile" ? 1.4 : 1.3
              })`,
            }}
            onClick={handleToggleEdit}
          >
            {language === "ja" ? "レシピ" : "Recipe"}
          </button>
          {"link" in recipe ? (
            <RecipeLinkEdit
              language={language}
              mediaContext={mediaContext}
              recipe={recipe}
              createOrEdit="edit"
              handleChangeEdit={handleToggleEdit}
            />
          ) : (
            <RecipeEdit
              language={language}
              mediaContext={mediaContext}
              recipe={recipe}
              error={error}
              createOrUpdate="update"
              handleChangeEdit={handleToggleEdit}
            />
          )}
        </>
      )}
      {recipe && !edit && (
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
              fontSize: `calc(${fontSizeFinal} * ${
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
              language={language}
              mediaContext={mediaContext}
              recipeWidth={parseFloat(recipeWidth)}
              recipeHeight={iframeHeight}
              recipe={recipe}
              mainOrRecipe="recipe"
            />
          ) : (
            <RecipeNoEdit
              language={language}
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
    </div>
  );
}
