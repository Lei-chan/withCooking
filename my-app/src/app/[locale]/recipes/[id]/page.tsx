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
import { MediaContext, UserContext } from "@/app/lib/providers";
//components
import RecipeNoEdit from "../../components/RecipeNoEdit/RecipeNoEdit";
import RecipeEdit from "../../components/RecipeEdit/RecipeEdit";
import RecipeLinkNoEdit from "../../components/RecipeLinkNoEdit/RecipeLinkNoEdit";
import RecipeLinkEdit from "../../components/RecipeLinkEdit/RecipeLinkEdit";
import { LoadingRecipe } from "../../components/recipeCommon/recipeCommon";
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

export default function Recipe() {
  const { locale, id } = useParams<{ locale: TYPE_LANGUAGE; id: string }>();
  const userContext = useContext(UserContext);

  //design
  const mediaContext = useContext(MediaContext);
  const [windowWidth, setWindowWidth] = useState<null | number>(null);
  const [windowHeight, setWindowHeight] = useState<null | number>(null);
  const [recipeWidth, setRecipeWidth] = useState<null | string>(null);
  const [iframeHeight, setIframeHeight] = useState<null | number>(null);
  const [fontSizeFinal, setFontSizeFinal] = useState("1.5vw");

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(document.documentElement.clientWidth);
      setWindowHeight(document.documentElement.clientHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!windowWidth) return;

    const recipeWid =
      windowWidth *
        (mediaContext === "mobile"
          ? 0.9
          : mediaContext === "tablet"
            ? 0.7
            : 0.5) +
      "px";
    setRecipeWidth(recipeWid);

    const fontSizeEn =
      mediaContext === "mobile"
        ? getSize(recipeWid, 0.045, "4.5vw")
        : mediaContext === "tablet"
          ? getSize(recipeWid, 0.034, "2.7vw")
          : mediaContext === "desktop" && windowWidth <= 1100
            ? getSize(recipeWid, 0.031, "1.5vw")
            : getSize(recipeWid, 0.028, "1.3vw");

    setFontSizeFinal(
      locale === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn,
    );
  }, [mediaContext, locale, windowWidth]);

  useEffect(() => {
    if (!windowHeight) return;

    setIframeHeight(windowHeight * 0.8);
  }, [windowHeight]);

  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE | TYPE_RECIPE_LINK>();
  const [edit, setEdit] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    (async () => await getRecipe(id))();
  }, [edit, id]);

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
        err.statusCode || 500,
      );

      const errorMessage = generateErrorMessage(locale, err, "recipe");

      setError(
        errorMessage ||
          (locale === "ja"
            ? "レシピのロード中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while loading recipe 🙇‍♂️ Please try again"),
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
        minHeight: "100dvh",
        maxHeight: "100%",
        padding:
          mediaContext === "mobile"
            ? "15% 0 5% 0"
            : mediaContext === "tablet"
              ? "10% 0 5% 0"
              : "2% 0",
      }}
    >
      {((!recipe && !error) ||
        !windowWidth ||
        !windowHeight ||
        !recipeWidth ||
        !iframeHeight) && <LoadingRecipe mediaContext={mediaContext} />}
      {!recipe &&
        error &&
        windowWidth &&
        windowHeight &&
        recipeWidth &&
        iframeHeight && (
          <div>
            <h1
              className={styles.no_content}
              style={{
                fontSize: `calc(${fontSizeFinal} * 2.5)`,
              }}
            >
              {error}
            </h1>
            <Link href={`/${locale}/recipes`}>
              {locale === "ja"
                ? "レシピまとめページに戻る"
                : "Return to the Recipes Page"}
            </Link>
          </div>
        )}
      {recipe &&
        edit &&
        windowWidth &&
        windowHeight &&
        recipeWidth &&
        iframeHeight && (
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
                top: "link" in recipe ? "2%" : "1%",
                right: "7%",
                fontSize: `calc(${fontSizeFinal} * ${
                  mediaContext === "mobile" ? 1.4 : 1.3
                })`,
              }}
              onClick={handleToggleEdit}
            >
              {locale === "ja" ? "レシピ" : "Recipe"}
            </button>
            {"link" in recipe ? (
              <RecipeLinkEdit
                language={locale}
                mediaContext={mediaContext}
                recipe={recipe}
                createOrEdit="edit"
                handleChangeEdit={handleToggleEdit}
              />
            ) : (
              <RecipeEdit
                language={locale}
                mediaContext={mediaContext}
                recipe={recipe}
                error={error}
                createOrUpdate="update"
                handleChangeEdit={handleToggleEdit}
              />
            )}
          </>
        )}
      {recipe &&
        !edit &&
        windowWidth &&
        windowHeight &&
        recipeWidth &&
        iframeHeight && (
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
                top: "link" in recipe ? "2%" : "1%",
                right: "10%",
                fontSize: `calc(${fontSizeFinal} * ${
                  mediaContext === "mobile" ? 1.5 : 1.4
                })`,
              }}
              type="button"
              onClick={handleToggleEdit}
            >
              {locale === "ja" ? "編集" : "Edit"}
            </button>
            {"link" in recipe ? (
              <RecipeLinkNoEdit
                language={locale}
                mediaContext={mediaContext}
                recipeWidth={parseFloat(recipeWidth)}
                recipeHeight={iframeHeight}
                recipe={recipe}
                mainOrRecipe="recipe"
              />
            ) : (
              <RecipeNoEdit
                language={locale}
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
