"use client";
//react
import React, { useContext, useEffect, useMemo, useState } from "react";
//next.js
import Image from "next/image";
import { useRouter } from "next/navigation";
//css
import styles from "./page.module.css";
//context
import { LanguageContext, MediaContext, UserContext } from "../lib/providers";
//components
import {
  MessageContainer,
  PaginationButtons,
} from "@/app/lib/components/components";
//type
import {
  TYPE_LANGUAGE,
  TYPE_MEDIA,
  TYPE_USER_CONTEXT,
  TYPE_USER_RECIPE,
  TYPE_USER_RECIPE_LINK,
} from "../lib/config/type";
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
//methods for recipes
import {
  getRecipesPerPage,
  calcNumberOfPages,
  getUserRecipes,
  createMessage,
} from "@/app/lib/helpers/recipes";

export default function Recipes() {
  const router = useRouter();
  const userContext = useContext(UserContext);

  //language
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "en";

  //design
  const mediaContext = useContext(MediaContext);
  const [windowWidth, setWindowWidth] = useState(1220);
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.5vw"
      : mediaContext === "tablet" && windowWidth < 650
      ? "3vw"
      : mediaContext === "tablet" && 650 <= windowWidth
      ? "2.5vw"
      : mediaContext === "desktop" && windowWidth < 900
      ? "2vw"
      : mediaContext === "desktop" && 900 <= windowWidth
      ? "1.5vw"
      : "1.2vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
  const recipesPerPage =
    mediaContext === "mobile"
      ? 6
      : mediaContext === "tablet" && windowWidth < 650
      ? 12
      : mediaContext === "tablet" && 650 <= windowWidth
      ? 18
      : mediaContext === "tablet" && 650 > windowWidth
      ? 24
      : 30;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //don't modify numberOfTotle recipes
  const numbreOfTotalRecipes = userContext?.numberOfRecipes || 0;
  // console.log(numbreOfTotalRecipes);

  const [numberOfPages, setNumberOfPages] = useState<number>(
    calcNumberOfPages(numbreOfTotalRecipes, recipesPerPage)
  );

  const [recipes, setRecipes] = useState<
    (TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK)[] | []
  >([]);
  const [curPage, setCurPage] = useState<number>(1);
  const [keyword, setKeyword] = useState("");

  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState("");

  function resetRecipes() {
    setRecipes([]);
    setCurPage(1);
  }

  // //set numberOfRecipes for the first render
  useEffect(() => {
    if (numbreOfTotalRecipes === 0) return;

    setNumberOfPages(calcNumberOfPages(numbreOfTotalRecipes, recipesPerPage));

    (async () => {
      setIsPending(true);
      await setUserRecipes();
      setIsPending(false);
    })();
  }, [numbreOfTotalRecipes, recipesPerPage]);

  async function setUserRecipes(key: string = "") {
    try {
      //If user doesn't have any recipes => return
      if (numbreOfTotalRecipes === 0) return;

      const data = await getUserRecipes(
        userContext?.accessToken,
        (curPage - 1) * recipesPerPage,
        recipesPerPage,
        key
      );

      setRecipes(data.data);
      setNumberOfPages(calcNumberOfPages(data.numberOfRecipes, recipesPerPage));

      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while getting recipes");

      console.error(
        "Error while getting recipes",
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "user");

      setError(
        errorMessage ||
          (language === "ja"
            ? "レシピ取得中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while getting recipes 🙇‍♂️ Please retry again!")
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  useEffect(() => {
    (async () => {
      setIsPending(true);
      await setUserRecipes(keyword);
      setIsPending(false);
    })();
  }, [curPage, keyword]);

  function displayPending(pendingOrNot: boolean) {
    setIsPending(pendingOrNot);
  }

  function displayError(message: string) {
    setError(message);
  }

  async function handleSearchRecipes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const keywordData = new FormData(e.currentTarget).get("keyword");
    if (!keywordData && keywordData !== "") return;

    const structuredKeyword = String(keywordData).trim().toLowerCase();

    setKeyword(structuredKeyword);
    setCurPage(1);
  }

  function handlePagination(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;

    btn.value === "decrease"
      ? setCurPage((prev) => (prev === 1 ? prev : prev - 1))
      : setCurPage((prev) => (prev === numberOfPages ? prev : prev + 1));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: " rgb(179, 248, 219)",
        paddingTop: "1%",
      }}
    >
      <SearchSection
        mediaContext={mediaContext}
        language={language}
        fontSize={fontSizeFinal}
        curPage={curPage}
        numberOfPages={numberOfPages}
        numberOfCurRecipes={recipes?.length || 0}
        onSubmitSearch={handleSearchRecipes}
      />
      <RecipeContainer
        mediaContext={mediaContext}
        language={language}
        userContext={userContext}
        fontSize={fontSizeFinal}
        isPending={isPending}
        numberOfTotalRecipes={numbreOfTotalRecipes}
        recipes={recipes}
        error={error}
        displayPending={displayPending}
        displayError={displayError}
        resetRecipes={resetRecipes}
      />
      <PaginationButtons
        mediaContext={mediaContext}
        language={language}
        fontSize={fontSizeFinal}
        styles={styles}
        curPage={curPage}
        numberOfPages={numberOfPages}
        isPending={isPending}
        onClickPagination={handlePagination}
      />
    </div>
  );
}

function SearchSection({
  mediaContext,
  language,
  fontSize,
  curPage,
  numberOfPages,
  numberOfCurRecipes,
  onSubmitSearch,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  curPage: number;
  numberOfPages: number;
  numberOfCurRecipes: number;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const router = useRouter();

  function handleClickCreate() {
    router.push("/recipes/create");
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft:
          mediaContext === "mobile" || mediaContext === "tablet" ? "0" : "3%",
        width: "100%",
        height: "15%",
        gap: mediaContext === "mobile" ? "3%" : "4%",
      }}
    >
      <p
        style={{
          position: "absolute",
          width:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "fit-content"
              : "17%",
          height: "fit-content",
          top:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "100%"
              : "0",
          left:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "10%"
              : "0",
          fontSize,
          letterSpacing: "0.05vw",
          color: "rgb(172, 112, 0)",
          textAlign: "center",
        }}
      >{`${curPage} / ${numberOfPages} ${
        language === "ja" ? "ページ" : numberOfPages === 1 ? "page" : "pages"
      } (${numberOfCurRecipes} ${
        language === "ja" ? "レシピ" : "recipes"
      })`}</p>
      <form
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "blueviolet",
          width:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "77%"
              : "60%",
          height: "68%",
          borderRadius: mediaContext === "mobile" ? "5px" : "7px",
          gap: "3%",
          boxShadow: "rgba(0, 0, 0, 0.31) 3px 3px 3px",
        }}
        onSubmit={onSubmitSearch}
      >
        <input
          style={{
            textAlign: "center",
            borderColor: "#ffa600ab",
            height: "55%",
            letterSpacing: "0.05vw",
            wordSpacing: "0.2vw",
            width: mediaContext === "mobile" ? "70%" : "55%",
            borderRadius: mediaContext === "mobile" ? "10% / 50%" : "1% / 10%",
            fontSize,
          }}
          type="search"
          name="keyword"
          placeholder={
            language === "ja" ? "レシピを検索" : "search your recipes"
          }
        />
        <button
          style={{
            minHeight: "50%",
            maxHeight: "fit-content",
            border: "none",
            backgroundColor: "rgb(255, 231, 126)",
            letterSpacing: "0.05vw",
            width: "fit-content",
            height: "fit-content",
            padding: "0.9% 1.4%",
            borderRadius: "30% / 50%",
            fontSize: `calc(${fontSize} * 0.85)`,
          }}
          type="submit"
        >
          {language === "ja" ? "検索" : "Search"}
        </button>
      </form>
      <button
        className={styles.btn__create}
        style={{
          fontSize: `calc(${fontSize} * 0.9)`,
        }}
        type="button"
        onClick={handleClickCreate}
      >
        {language === "ja" ? "新規作成" : "Create"}
      </button>
    </div>
  );
}

function RecipeContainer({
  mediaContext,
  language,
  userContext,
  fontSize,
  isPending,
  numberOfTotalRecipes,
  recipes,
  error,
  displayPending,
  displayError,
  resetRecipes,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  isPending: boolean;
  numberOfTotalRecipes: number;
  recipes: (TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK)[] | [];
  error: string;
  displayPending: (pendingOrNot: boolean) => void;
  displayError: (message: string) => void;
  resetRecipes: () => void;
}) {
  const router = useRouter();

  //design
  const numberOfColumns =
    mediaContext === "mobile"
      ? 1
      : mediaContext === "tablet" && window.innerWidth < 650
      ? 2
      : mediaContext === "tablet" && 650 <= window.innerWidth
      ? 3
      : mediaContext === "tablet" && 650 > window.innerWidth
      ? 4
      : 5;

  //set recipes
  const RECIPES_PER_COLUMN = 6;
  const [recipesPerColumn, setRecipesPerColumn] = useState<
    (TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK)[][] | [][] | []
  >(new Array(numberOfColumns).fill([]));

  //recipes for each column array[];
  const getRecipesPerColumn = useMemo(() => {
    const recipesPerColumnArr = new Array(numberOfColumns).fill("");

    return recipesPerColumnArr.map((_, i) =>
      getRecipesPerPage(recipes, RECIPES_PER_COLUMN, i + 1)
    );
  }, [recipes, numberOfColumns, RECIPES_PER_COLUMN]);

  useEffect(() => {
    setRecipesPerColumn(
      getRecipesPerColumn as (TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK)[][]
    );
  }, [recipes]);

  //select recipe
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[] | []>([]);

  //message
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const msg = createMessage(
      language,
      error,
      isPending,
      numberOfTotalRecipes,
      recipes.length
    ) as string;

    setMessage(msg);
  }, [language, error, isPending, numberOfTotalRecipes, recipes.length]);

  function handleToggleSelectBtn() {
    isSelecting && setSelectedRecipeIds([]);
    setIsSelecting(!isSelecting);
  }

  function addSelectedRecipe(e: React.ChangeEvent<HTMLInputElement>) {
    const curTarget = e.currentTarget;

    //first filter out same recipe id already added and set selected recipe
    if (curTarget.checked)
      setSelectedRecipeIds((prev) => {
        const newIds = [...prev].filter((id) => id !== curTarget.value);
        newIds.push(curTarget.value);
        return newIds;
      });

    //delete unchecked one
    if (!curTarget.checked)
      setSelectedRecipeIds((prev) => {
        const newIds = [...prev].filter((id) => id !== curTarget.value);
        return newIds;
      });
  }

  async function handleSubmitDeleteRecipe(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      if (!selectedRecipeIds.length) return;

      displayPending(true);
      await getData(`/api/recipes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedRecipeIds }),
      });

      await getData(`/api/users/recipes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userContext?.accessToken}`,
        },
        body: JSON.stringify({ ids: selectedRecipeIds }),
      });

      userContext?.reduceNumberOfRecipes(selectedRecipeIds.length);

      setIsSelecting(false);
      setSelectedRecipeIds([]);
      resetRecipes();
      displayPending(false);
      setSuccessMessage(
        language === "ja"
          ? "レシピが削除されました"
          : `Recipe${selectedRecipeIds.length > 1 ? "s" : ""} deleted`
      );
      await wait();
      setSuccessMessage("");
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while deleting recipe");

      console.error(
        "Error while deleting recipe",
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "user");

      displayError(
        errorMessage ||
          (language === "ja"
            ? "レシピの削除中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while deleting recipe 🙇‍♂️ Please try again")
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  return (
    <form
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${numberOfColumns}, 1fr)`,
        width: mediaContext === "mobile" ? "100%" : "90%",
        height: "73%",
        paddingTop:
          mediaContext === "mobile" || mediaContext === "tablet" ? "10%" : "3%",
        justifyItems: "center",
      }}
      onSubmit={handleSubmitDeleteRecipe}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "row",
          top: "0",
          right:
            mediaContext === "mobile" || mediaContext === "tablet" ? "7%" : "0",
          width:
            mediaContext === "mobile"
              ? "38%"
              : mediaContext === "tablet"
              ? "25%"
              : "16%",
          height: "fit-content",
          gap: "5%",
          zIndex: "10",
          alignItems: "center",
          justifyContent: "end",
        }}
      >
        {isSelecting && (
          <button
            className={styles.btn__trash_img}
            style={{
              width:
                mediaContext === "mobile"
                  ? "18%"
                  : mediaContext === "tablet"
                  ? "15%"
                  : "18%",
              aspectRatio: "1",
              zIndex: "100",
            }}
            type="submit"
          ></button>
        )}
        <button
          style={{
            width: "fit-content",
            height: "fit-content",
            fontSize: `calc(${fontSize} * ${
              mediaContext === "mobile" || mediaContext === "tablet"
                ? 0.92
                : 0.95
            })`,
            letterSpacing: "0.05vw",
            color: "white",
            textAlign: "center",
            backgroundColor: "rgb(172, 112, 0)",
            border: "none",
            borderRadius: "3px",
            padding:
              mediaContext === "mobile"
                ? "0.8% 2%"
                : mediaContext === "tablet"
                ? "1% 2%"
                : "2.5%",
          }}
          type="button"
          onClick={handleToggleSelectBtn}
        >
          {!isSelecting
            ? language === "ja"
              ? "レシピを選択"
              : "Select Recipe"
            : language === "ja"
            ? "選択を終了"
            : "Stop Selecting"}
        </button>
      </div>
      {/* when there are no recipes => message, otherwise recipes */}
      {!isPending && !error && recipesPerColumn[0].length ? (
        recipesPerColumn.map((recipes, i) => (
          <ul
            key={i}
            style={{
              width:
                mediaContext === "mobile" || mediaContext === "tablet"
                  ? "85%"
                  : "90%",
              height: "100%",
              zIndex: "1",
              overflow: "hidden",
            }}
          >
            {recipes.map(
              (recipe: TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK, i: number) => {
                return (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      height: "15%",
                      display: "flex",
                      flexDirection: "row",
                      gap: "3%",
                      marginTop: "2%",
                    }}
                  >
                    {isSelecting && (
                      <input
                        style={{
                          width:
                            mediaContext === "mobile"
                              ? "7%"
                              : mediaContext === "tablet"
                              ? "8%"
                              : "10%",
                        }}
                        type="checkbox"
                        name="checkbox"
                        value={recipe._id}
                        onChange={addSelectedRecipe}
                      ></input>
                    )}
                    <RecipePreview
                      key={i}
                      mediaContext={mediaContext}
                      language={language}
                      fontSize={fontSize}
                      recipe={recipe}
                      isSelecting={isSelecting}
                    />
                  </div>
                );
              }
            )}
          </ul>
        ))
      ) : (
        <MessageContainer
          message={message}
          fontSize={`calc(${fontSize} * ${
            mediaContext === "mobile" ? 1.1 : 1.2
          })`}
          letterSpacing={"0.1vw"}
          wordSpacing={"0.3vw"}
        />
      )}
      {successMessage && (
        <div
          style={{
            position: "absolute",
            width:
              mediaContext === "mobile"
                ? "85%"
                : mediaContext === "tablet"
                ? "50%"
                : "30%",
            height: "fit-content",
            backgroundColor: "rgba(208, 255, 155, 1)",
            boxShadow: "rgba(0, 0, 0, 0.33) 2px 2px 4px",
            borderRadius: "5px",
            bottom: "0%",
            color: "brown",
            textAlign: "center",
            padding:
              mediaContext === "mobile"
                ? "3%"
                : mediaContext === "tablet"
                ? "1.5%"
                : "1%",
            fontSize,
            zIndex: "10",
          }}
        >
          {successMessage}
        </div>
      )}
    </form>
  );
}

function RecipePreview({
  mediaContext,
  language,
  fontSize,
  recipe,
  isSelecting,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  recipe: TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK;
  isSelecting: boolean;
}) {
  const router = useRouter();

  //design
  const mainImageSize = mediaContext === "mobile" ? "50px" : "46px";

  function handleClickPreview(e: React.MouseEvent<HTMLElement>) {
    const id = e.currentTarget.id;

    router.push(`/recipes/${id}`);
  }

  return (
    <li
      className={styles.recipe_preview}
      style={{
        width: !isSelecting
          ? "100%"
          : mediaContext === "mobile"
          ? "90%"
          : "80%",
        height: "100%",
      }}
      id={recipe._id}
      onClick={handleClickPreview}
    >
      {"mainImagePreview" in recipe && recipe.mainImagePreview?.data ? (
        <Image
          style={{ borderRadius: "50%" }}
          src={recipe.mainImagePreview.data}
          alt={language === "ja" ? "メイン画像" : "main image"}
          width={parseFloat(mainImageSize)}
          height={parseFloat(mainImageSize)}
        ></Image>
      ) : (
        <div
          style={{
            borderRadius: "50%",
            width: mainImageSize,
            height: mainImageSize,
            backgroundColor: "grey",
          }}
        ></div>
      )}
      <p
        className={styles.title}
        style={{
          fontSize:
            mediaContext === "mobile" ? `calc(${fontSize} * 1.1)` : fontSize,
        }}
      >
        {recipe.title}
      </p>
      {recipe.favorite && (
        <Image
          src="/icons/star-on.png"
          alt={language === "ja" ? "アイコンお気に入り" : "favorite icon"}
          width={parseFloat(mainImageSize) / 3}
          height={parseFloat(mainImageSize) / 3}
        ></Image>
      )}
    </li>
  );
}
