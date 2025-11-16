"use client";
//react
import React, { useEffect, useRef, useState, useContext, useMemo } from "react";
//next.js
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
//context
import { LanguageContext, MediaContext, UserContext } from "../lib/providers";
//model
import news from "@/app/lib/models/news";
//components
import {
  LanguageSelect,
  OverlayMessage,
  PaginationButtons,
  RecipeLinkNoEdit,
  RecipeNoEdit,
} from "../lib/components/components";
//type
import {
  TYPE_USER_CONTEXT,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_LANGUAGE,
  TYPE_RECIPE_LINK,
} from "../lib/config/type";
//general methods
import {
  authErrorRedirect,
  generateErrorMessage,
  getData,
  getFontSizeForLanguage,
  getSize,
  isApiError,
  logNonApiError,
} from "@/app/lib/helpers/other";
//methods for recipes
import {
  createMessage,
  calcNumberOfPages,
  getUserRecipes,
} from "@/app/lib/helpers/recipes";
//library
import { nanoid } from "nanoid";
import { WEBSITE_URL } from "../lib/config/settings";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function MAIN() {
  const router = useRouter();
  const searchRef = useRef(null);
  const userContext = useContext(UserContext);

  //language
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "en";

  //design
  const mediaContext = useContext(MediaContext);

  const [windowWidth, setWindowWidth] = useState(1220);
  const [windowHeight, setWindowHeight] = useState(600);
  const [recipeWidth, setRecipeWidth] = useState(
    mediaContext === "mobile"
      ? windowWidth + "px"
      : mediaContext === "tablet"
      ? windowWidth * 0.65 + "px"
      : windowWidth * 0.55 + "px"
  );
  const [timerMemoWidth, setTimerMemoWidth] = useState(
    mediaContext === "mobile"
      ? windowWidth + "px"
      : windowWidth - parseFloat(recipeWidth) + "px"
  );
  const [timerHeight, setTimerHeight] = useState(windowHeight * 0.65 + "px");

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);

  function handleMouseDownX() {
    setIsDraggingX(true);
  }

  function handleMouseDownY() {
    if (mediaContext === "mobile") return;
    setIsDraggingY(true);
  }

  function handleMouseUp() {
    setIsDraggingX(false);
    mediaContext !== "mobile" && setIsDraggingY(false);
  }

  function handleMouseMoveRecipe(e: React.MouseEvent<HTMLDivElement>) {
    if (isDraggingX) {
      const positioX = e.clientX;
      setRecipeWidth(`${positioX}px`);
      setTimerMemoWidth(windowWidth - positioX + "px");
    }

    if (isDraggingY) {
      const positionY = e.clientY;
      setTimerHeight(`${positionY}px`);
    }
  }

  const handleToggleDropdown = function () {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleToggleSearch = function () {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleCloseDropdownSearch = function (
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const target = e.target as HTMLElement;

    if (
      target.closest("ul") ||
      target.closest("div") === searchRef.current ||
      target.closest('button[value="increase"]') ||
      target.closest('button[value="decrease"]') ||
      (!isDropdownVisible && !isSearchVisible)
    )
      return;

    setIsDropdownVisible(false);
    setIsSearchVisible(false);
  };

  function handleToggleLogout() {
    setIsMessageVisible(!isMessageVisible);
  }

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onClick={handleCloseDropdownSearch}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMoveRecipe}
    >
      {userContext?.isMessageVisible && (
        <OverlayMessage
          language={language}
          mediaContext={mediaContext}
          option="message"
          content="welcome"
        />
      )}
      {isMessageVisible && (
        <OverlayMessage
          language={language}
          mediaContext={mediaContext}
          option="question"
          content="logout"
          toggleLogout={handleToggleLogout}
        />
      )}
      <div
        style={
          mediaContext === "mobile"
            ? { width: "100%", height: "100%" }
            : {
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100%",
              }
        }
      >
        <Search
          searchRef={searchRef}
          mediaContext={mediaContext}
          language={language}
          userContext={userContext}
          innerWidth={windowWidth}
          isSearchVisible={isSearchVisible}
          onClickSearch={handleToggleSearch}
        />
        {mediaContext !== "mobile" && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: `calc(${recipeWidth} - 1.5%)`,
              width: "2%",
              height: "100%",
              cursor: "ew-resize",
              zIndex: "5",
            }}
            onMouseDown={handleMouseDownX}
          ></div>
        )}
        <DropdownMenu
          mediaContext={mediaContext}
          language={language}
          router={router}
          isDropdownVisible={isDropdownVisible}
          onClickDropdown={handleToggleDropdown}
          onClickLogout={handleToggleLogout}
        />

        <section
          style={{
            position: "relative",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: recipeWidth,
            height: "100%",
            overflowY: "auto",
            scrollbarColor: "rgb(255, 255, 232) rgb(253, 231, 157)",
          }}
        >
          <Recipe
            mediaContext={mediaContext}
            language={language}
            userContext={userContext}
            router={router}
            recipeWidth={recipeWidth}
            innerHeight={windowHeight}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateRows: `${timerHeight} calc(100% - ${timerHeight})`,
            width:
              mediaContext === "mobile"
                ? "100%"
                : `calc(100% - ${recipeWidth})`,
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `calc(${timerHeight} - 2%)`,
              right: "0",
              width: `calc(100% - ${recipeWidth})`,
              height: "2%",
              cursor: "ns-resize",
              zIndex: "5",
            }}
            onMouseDown={handleMouseDownY}
          ></div>
          <Timers
            mediaContext={mediaContext}
            language={language}
            innerWidth={windowWidth}
            timerWidth={timerMemoWidth}
          />
          <Memos
            mediaContext={mediaContext}
            language={language}
            innerWidth={windowWidth}
            memoWidth={timerMemoWidth}
          />
        </section>
      </div>
    </div>
  );
}

function Recipe({
  mediaContext,
  language,
  userContext,
  router,
  recipeWidth,
  innerHeight,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  userContext: TYPE_USER_CONTEXT;
  router: AppRouterInstance;
  recipeWidth: string;
  innerHeight: number;
}) {
  const [recipe, setRecipe] = useState<TYPE_RECIPE | TYPE_RECIPE_LINK | null>(
    null
  );

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  async function handleHashChange() {
    const id = window.location.hash.slice(1);
    if (!id)
      return setMessage(
        language === "ja"
          ? "レシピを検索してクッキングを始めましょう！"
          : "Let's start cooking by selecting your recipe :)"
      );
    await getRecipe(id);
  }

  async function getRecipe(id: string) {
    try {
      setIsLoading(true);
      setMessage("");
      setError("");
      const recipeData = await getData(`/api/recipes?id=${id}`, {
        method: "GET",
      });

      setRecipe(recipeData.data);
      setIsLoading(false);
    } catch (err: unknown) {
      setIsLoading(false);

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
            ? "レシピのロード中にエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while loading recipe 🙇‍♂️ Please try again")
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  if (error || message || isLoading)
    return (
      <div
        className={styles.no_results}
        style={{
          fontSize: getSize(
            recipeWidth,
            language === "ja" ? 0.04 : 0.043,
            "2.5vw"
          ),
        }}
      >
        {error ||
          message ||
          (language === "ja" ? "レシピをロード中…" : "Loading your recipe...")}
      </div>
    );

  if (!message && !error && !isLoading && recipe)
    return "link" in recipe ? (
      <RecipeLinkNoEdit
        language={language}
        mediaContext={mediaContext}
        recipeWidth={parseFloat(recipeWidth)}
        recipeHeight={innerHeight}
        recipe={recipe}
        mainOrRecipe="main"
      />
    ) : (
      <RecipeNoEdit
        language={language}
        mediaContext={mediaContext}
        userContext={userContext}
        recipeWidth={recipeWidth}
        error=""
        mainOrRecipe="main"
        userRecipe={recipe}
      />
    );
}

function Search({
  mediaContext,
  language,
  userContext,
  innerWidth,
  isSearchVisible,
  searchRef,
  onClickSearch,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  userContext: TYPE_USER_CONTEXT;
  innerWidth: number;
  isSearchVisible: boolean;
  searchRef: React.RefObject<null>;
  onClickSearch: () => void;
}) {
  const router = useRouter();

  //design
  const RECIPES_PER_PAGE = 6;
  const searchMenuSize =
    innerWidth *
      (mediaContext === "mobile"
        ? 0.7
        : mediaContext === "tablet"
        ? 0.5
        : mediaContext === "desktop" && innerWidth <= 1100
        ? 0.35
        : 0.28) +
    "px";
  const fontSizeEn =
    parseFloat(searchMenuSize) *
      (mediaContext === "mobile"
        ? 0.07
        : mediaContext === "tablet"
        ? 0.06
        : 0.055) +
    "px";
  const fontSizeFinal =
    language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;
  const mainImageSize = parseFloat(searchMenuSize) * 0.2 + "px";

  const [recipes, setRecipes] = useState<
    (TYPE_RECIPE | TYPE_RECIPE_LINK)[] | []
  >([]);
  //don't modify originalNumberOfRecipes
  const originalNumberOfRecipes = userContext?.numberOfRecipes || 0;
  const [numberOfPages, setNumberOfPages] = useState<number>(
    calcNumberOfPages(originalNumberOfRecipes, RECIPES_PER_PAGE)
  );
  const [curPage, setCurPage] = useState<number>(1);

  const [keyword, setKeyword] = useState("");

  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  //set originalNumberOfRecipes for the first render
  useEffect(() => {
    if (originalNumberOfRecipes === 0) return;

    setNumberOfPages(
      calcNumberOfPages(originalNumberOfRecipes, RECIPES_PER_PAGE)
    );

    (async () => {
      setIsPending(true);
      await setUserRecipes();
      setIsPending(false);
    })();
  }, [originalNumberOfRecipes]);

  //6 recipes per fetch
  async function setUserRecipes(key: string = "") {
    try {
      //If user doesn't have any recipes => return
      if (!originalNumberOfRecipes) return;

      const RECIPES_PER_FETCH = 6;

      const data = await getUserRecipes(
        userContext?.accessToken,
        (curPage - 1) * RECIPES_PER_FETCH,
        RECIPES_PER_FETCH,
        key
      );

      setRecipes(data.data);
      setNumberOfPages(
        calcNumberOfPages(data.numberOfRecipes, RECIPES_PER_PAGE)
      );

      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err: unknown) {
      if (!isApiError(err))
        return logNonApiError(err, "Error while getting recipes");

      console.error(
        "Error while getting recipes",
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "recipe");

      setError(
        errorMessage ||
          (language === "ja"
            ? "レシピ取得中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while getting recipes 🙇‍♂️ Please retry again")
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  //when curPage changes, change curRecipes too
  useEffect(() => {
    if (!originalNumberOfRecipes) return;

    (async () => {
      setIsPending(true);
      await setUserRecipes(keyword);
      setIsPending(false);
    })();
  }, [curPage, keyword, originalNumberOfRecipes]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const keywordData = new FormData(e.currentTarget).get("keyword");
    if (!keywordData && keywordData !== "") return;

    const structuredKeyword = String(keywordData).trim().toLowerCase();

    setKeyword(structuredKeyword);
    setCurPage(1);
  }

  //I'm gonna make it work for arrow keydown event later too!
  function handlePagination(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;

    target.value === "decrease"
      ? setCurPage((prev) => prev - 1)
      : setCurPage((prev) => prev + 1);
  }

  function handleClickPreview(recipe: TYPE_RECIPE | TYPE_RECIPE_LINK) {
    if (recipe._id) window.location.hash = recipe._id;
  }

  useEffect(() => {
    const message = createMessage(
      language,
      error,
      isPending,
      originalNumberOfRecipes,
      recipes.length
    ) as string;
    setMessage(message);
  }, [language, error, isPending, originalNumberOfRecipes, recipes.length]);

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: searchMenuSize,
        height: "100%",
        zIndex: "10",
        transition: "all 0.3s",
        transform: !isSearchVisible ? "translateX(-100%)" : "translateX(0%)",
        fontSize: fontSizeFinal,
      }}
    >
      <button
        className={styles.btn__search_menu}
        type="button"
        onClick={onClickSearch}
      ></button>
      <div className={styles.search_menu} ref={searchRef}>
        <form className={styles.container__search} onSubmit={handleSubmit}>
          <input
            id={styles.input__search}
            style={{ fontSize: `calc(${fontSizeFinal} * 0.9)` }}
            name="keyword"
            type="search"
            placeholder={
              language === "ja" ? "レシピを検索" : "Search your recipe"
            }
          ></input>
          <button
            className={styles.btn__search}
            style={{ fontSize: `calc(${fontSizeFinal} * 0.7)` }}
            type="submit"
          >
            {language === "ja" ? "検索" : "Search"}
          </button>
        </form>
        <ul className={styles.search_results}>
          {message ? (
            <p
              className={styles.no_results}
              style={{ fontSize: fontSizeFinal }}
            >
              {message}
            </p>
          ) : (
            recipes.map((recipe, i) => (
              <li
                key={i}
                className={styles.recipe_preview}
                onClick={() => handleClickPreview(recipe)}
              >
                {"mainImagePreview" in recipe &&
                recipe.mainImagePreview?.data ? (
                  <Image
                    style={{ borderRadius: "50%", maxHeight: "95%" }}
                    src={recipe.mainImagePreview.data}
                    alt={language === "ja" ? "メイン画像" : "main image"}
                    width={parseFloat(mainImageSize)}
                    height={parseFloat(mainImageSize)}
                  ></Image>
                ) : (
                  <div
                    style={{
                      backgroundColor: "grey",
                      width: mainImageSize,
                      height: mainImageSize,
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
                <p className={styles.title}>{recipe.title}</p>
                {recipe.favorite && (
                  <Image
                    src="/icons/star-on.png"
                    alt={
                      language === "ja" ? "アイコンお気に入り" : "favorite icon"
                    }
                    width={parseFloat(mainImageSize) * 0.3}
                    height={parseFloat(mainImageSize) * 0.3}
                  ></Image>
                )}
              </li>
            ))
          )}
        </ul>
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
    </div>
  );
}

function DropdownMenu({
  mediaContext,
  language,
  router,
  isDropdownVisible,
  onClickDropdown,
  onClickLogout,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  router: AppRouterInstance;
  isDropdownVisible: boolean;
  onClickDropdown: () => void;
  onClickLogout: () => void;
}) {
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : "1.8vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);

  //check if news has new info
  const isNewsNew = useMemo(() => news.some((news) => news.new), [news]);

  function handleClickRecipes() {
    router.push("/recipes");
  }

  function handleClickConverter() {
    router.push("/converter");
  }

  function handleClickAccount() {
    router.push("/account");
  }

  function handleClickNews() {
    router.push("/news");
  }

  function handleClickHowToUse() {
    router.push("/how-to-use");
  }

  function handleClickFeedback() {
    router.push("/feedback");
  }

  return (
    <div
      style={{
        position: "absolute",
        top:
          mediaContext === "mobile" || mediaContext === "tablet" ? "0%" : "1%",
        right: "3%",
        aspectRatio: "1 / 1.9",
        zIndex: "10",
        width:
          mediaContext === "mobile"
            ? "60%"
            : mediaContext === "tablet"
            ? "38%"
            : "20%",
        maxHeight: "80%",
        pointerEvents: !isDropdownVisible ? "none" : "all",
      }}
    >
      <button
        style={{
          pointerEvents: "all",
          width:
            mediaContext === "mobile"
              ? "16%"
              : mediaContext === "tablet"
              ? "19%"
              : "22%",
          aspectRatio: "1",
          background: "none",
          border: "none",
          backgroundImage: 'url("/icons/dropdown.svg")',
          backgroundRepeat: "no-repeat",
          backgroundSize: "65%",
          backgroundPosition: "center",
          marginLeft:
            mediaContext !== "desktop" && mediaContext !== "big"
              ? "90%"
              : "80%",
        }}
        type="button"
        onClick={onClickDropdown}
      ></button>
      <ul
        style={{
          width: "100%",
          height: "100%",
          listStyleType: "none",
          textAlign: "center",
          borderRadius: "1.8% / 1%",
          boxShadow: "rgba(0, 0, 0, 0.315) 4px 4px 10px",
          overflow: "hidden",
          transition: "all 0.4s",
          fontSize: fontSizeFinal,
          backgroundColor: "orange",
          opacity: !isDropdownVisible ? 0 : 1,
        }}
      >
        <div className={styles.link__dropdown} onClick={handleClickRecipes}>
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/recipes.svg"}
              alt={language === "ja" ? "アイコンレシピ" : "recipe icon"}
              width={25}
              height={25}
            ></Image>
            <span>{language === "ja" ? "レシピ" : "Recipes"}</span>
          </li>
        </div>
        <div className={styles.link__dropdown} onClick={handleClickConverter}>
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/convert.svg"}
              alt={language === "ja" ? "アイコン単位変換" : "converter icon"}
              width={25}
              height={25}
            ></Image>
            <span>{language === "ja" ? "単位変換" : "Converter"}</span>
          </li>
        </div>
        <div className={styles.link__dropdown} onClick={handleClickAccount}>
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/account.svg"}
              alt={language === "ja" ? "アイコンアカウント" : "account icon"}
              width={25}
              height={25}
            ></Image>
            <span>{language === "ja" ? "アカウント" : "Account"}</span>
          </li>
        </div>
        <div className={styles.link__dropdown} onClick={handleClickNews}>
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/news.svg"}
              alt={language === "ja" ? "アイコンニュース" : "news icon"}
              width={25}
              height={25}
            ></Image>
            <span>{language === "ja" ? "ニュース" : "News"}</span>
            {isNewsNew && (
              <span
                style={{
                  fontSize: `calc(${fontSizeFinal} * 0.9)`,
                  color: "orangered",
                }}
              >
                new!
              </span>
            )}
          </li>
        </div>
        <div className={styles.link__dropdown} onClick={handleClickHowToUse}>
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/howtouse.svg"}
              alt={language === "ja" ? "アイコン使い方" : "how to use icon"}
              width={25}
              height={25}
            ></Image>
            <span>{language === "ja" ? "使い方" : "How To Use"}</span>
          </li>
        </div>
        <div className={styles.link__dropdown} onClick={handleClickFeedback}>
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/feedback.svg"}
              alt={
                language === "ja" ? "アイコンフィードバック" : "feedback icon"
              }
              width={25}
              height={25}
            ></Image>
            <span>{language === "ja" ? "フィードバック" : "Feedback"}</span>
          </li>
        </div>
        <li
          className={styles.list}
          style={{ gap: "8%" }}
          onClick={onClickLogout}
        >
          <Image
            src={"/icons/logout.svg"}
            alt={language === "ja" ? "アイコンログアウト" : "logout icon"}
            width={25}
            height={25}
          ></Image>
          <span style={{ color: "rgba(233, 4, 4, 1)" }}>
            {language === "ja" ? "ログアウト" : "Logout"}
          </span>
        </li>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "calc(100% - (100% / 7.9 * 7))",
            backgroundColor: "orange",
          }}
        >
          <LanguageSelect
            mediaContext={mediaContext}
            fontSize={`calc(${fontSizeFinal} * 0.8)`}
            position="relative"
            minWidth="50%"
            backgroundColor="transparent"
            color="rgba(3, 46, 124, 1)"
          />
          <p
            style={{ fontSize: `calc(${fontSizeFinal} * 0.8)`, color: "brown" }}
          >
            Ver 1.0.0
          </p>
        </div>
      </ul>
    </div>
  );
}

function Timers({
  mediaContext,
  language,
  innerWidth,
  timerWidth,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  innerWidth: number;
  timerWidth: string;
}) {
  //design
  const MAX_TIMERS = 10;
  const fontSizeEn =
    mediaContext === "mobile"
      ? getSize(timerWidth, 0.045, "3.5vw")
      : mediaContext === "tablet"
      ? getSize(timerWidth, 0.07, "2.7vw")
      : mediaContext === "desktop" && innerWidth <= 1100
      ? getSize(timerWidth, 0.035, "1.5vw")
      : getSize(timerWidth, 0.031, "1.3vw");
  const fontSizeFinal =
    language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;

  const [timerKeys, setTimerKeys] = useState(
    Array(1)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
  );

  const handleDeleteTimers = function (i: number) {
    if (!timerKeys.length) return;
    setTimerKeys((prev) => prev.toSpliced(i, 1));
  };

  const handleAddTimers = function () {
    if (timerKeys.length === MAX_TIMERS) return;
    setTimerKeys((prev) => [...prev, { id: nanoid() }]);
  };

  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: "linear-gradient(rgb(255, 217, 0), rgb(255, 166, 1))",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        scrollbarColor: "rgb(255, 199, 125) rgb(212, 120, 0)",
        textAlign: "center",
        padding: "3% 0 1% 0",
      }}
    >
      <h2
        style={{
          fontSize: `calc(${fontSizeFinal} * 1.4)`,
          letterSpacing: "0.1vw",
          marginBottom: "5%",
        }}
      >
        {language === "ja" ? "タイマー" : "Timers"}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "1fr"
              : "1fr 1fr",
          rowGap: mediaContext === "mobile" ? "3%" : "1%",
          justifyItems: "center",
          width:
            mediaContext === "mobile"
              ? "90%"
              : mediaContext === "tablet"
              ? "100%"
              : mediaContext === "desktop" && innerWidth <= 1100
              ? "95%"
              : "90%",
          height: "fit-content",
          fontSize: fontSizeFinal,
        }}
      >
        {timerKeys.map((keyObj, i) => (
          <Timer
            key={keyObj.id}
            mediaContext={mediaContext}
            language={language}
            fontSize={fontSizeFinal}
            index={i}
            onClickDelete={handleDeleteTimers}
          />
        ))}
        {timerKeys.length === MAX_TIMERS || (
          <div
            className={styles.container__timer}
            style={{
              justifyContent: "center",
              width: mediaContext === "mobile" ? "80%" : "90%",
            }}
          >
            <button
              className={styles.btn__timer}
              style={{
                width: "fit-content",
                aspectRatio: "1",
                letterSpacing: "0.05vw",
                lineHeight: "105%",
                padding: "4%",
                backgroundImage:
                  "linear-gradient(rgb(251, 255, 0), rgb(255, 217, 0))",
                fontSize: `calc(${fontSizeFinal} * 0.9)`,
              }}
              onClick={handleAddTimers}
            >
              +<br />
              {language === "ja" ? "追加" : "Add"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Timer({
  mediaContext,
  language,
  fontSize,
  index,
  onClickDelete,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  index: number;
  onClickDelete: (i: number) => void;
}) {
  const MAX_HOURS = 23;
  const MAX_MINUTES = 59;
  const MAX_SECONDS = 59;

  //design
  const fontSizeInput =
    parseFloat(fontSize) * (language === "ja" ? 1.1 : 1.2) + "px";
  const fontSizeBtn =
    parseFloat(fontSize) * (language === "ja" ? 0.7 : 0.9) + "px";

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultTime = { hours: "", minutes: "", seconds: "" };
  const [title, setTitle] = useState(
    `${language === "ja" ? "タイマー" : "Timer"} ${index + 1}`
  );
  const [time, setTime] = useState(defaultTime);
  const [paused, setPaused] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  function isTimerSet() {
    return !time.hours && !time.minutes && !time.seconds ? false : true;
  }

  const handleChangeTitle = function (e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.currentTarget.value);
  };

  useEffect(() => {
    if (!isTimerSet()) return;

    //if paused is true, get rid of the timeout
    if (paused) {
      timeoutId && clearTimeout(timeoutId);
      return;
    }

    const id = setTimeout(() => {
      const numberHours = parseInt(time.hours);
      const numberMinutes = parseInt(time.minutes);
      const numberSeconds = parseInt(time.seconds);

      if (!numberHours && !numberMinutes && !numberSeconds)
        return audioRef.current?.play();

      setNewTime(numberSeconds, numberMinutes, numberHours);
    }, 1000);

    setTimeoutId(id);

    return () => clearTimeout(id);
  }, [time, paused]);

  function setNewTime(
    curNumberSeconds: number,
    curNumberMinutes: number,
    curNumberHours: number
  ) {
    const nextSeconds = !curNumberSeconds
      ? "59"
      : (curNumberSeconds - 1).toString().padStart(2, "0");

    let nextMinutes: string = "0";
    if (nextSeconds === "59") {
      if (!curNumberMinutes) nextMinutes = "59";
      if (curNumberMinutes)
        nextMinutes = (curNumberMinutes - 1).toString().padStart(2, "0");
    } else {
      nextMinutes = time.minutes;
    }

    let nextHours: string = "0";
    if (nextSeconds === "59" && nextMinutes === "59") {
      if (!curNumberHours) nextHours = "00";
      if (curNumberHours)
        nextHours = (curNumberHours - 1).toString().padStart(2, "0");
    } else {
      nextHours = time.hours;
    }

    setTime({
      hours: nextHours,
      minutes: nextMinutes,
      seconds: nextSeconds,
    });
  }

  const handleStart = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const inputHours = +(formData.get("hours") || 0);
    const inputMinutes = +(formData.get("minutes") || 0);
    const inputSeconds = +(formData.get("seconds") || 0);

    if (!validateTime(inputHours, inputMinutes, inputSeconds)) return;

    const newTime = convertTime(inputHours, inputMinutes, inputSeconds);
    if (!newTime) return;

    setTime(newTime);
  };

  function convertTime(hours: number, minutes: number, seconds: number) {
    if (hours > MAX_HOURS) return null;

    //all fields within the allowed range
    if (minutes <= MAX_MINUTES && seconds <= MAX_SECONDS)
      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      };

    //minutes, seconds, or both are not within the allowd range => convert
    const newSeconds = seconds % 60;
    const min = +parseInt(seconds / 60 + "") + minutes;
    const newMinutes = min % 60;
    const newHours = +parseInt(min / 60 + "") + hours;

    if (newHours > MAX_HOURS) return null;

    return {
      hours: newHours.toString().padStart(2, "0"),
      minutes: newMinutes.toString().padStart(2, "0"),
      seconds: newSeconds.toString().padStart(2, "0"),
    };
  }

  function validateTime(hours: number, minutes: number, seconds: number) {
    //if no input => false
    if (!hours && !minutes && !seconds) return false;

    //if input is lower than 0 => false
    if (
      (hours && hours < 0) ||
      (minutes && minutes < 0) ||
      (seconds && seconds < 0)
    )
      return false;

    if (!convertTime(hours, minutes, seconds)) return false;

    return true;
  }

  const handleStop = function () {
    if (
      parseInt(time.hours) ||
      parseInt(time.minutes) ||
      parseInt(time.seconds)
    )
      return setPaused(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTime(defaultTime);
  };

  const togglePaused = () => {
    setPaused(!paused);
  };

  const handlePause = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "start") return;

    if (!isTimerSet()) return;

    togglePaused();
  };

  const handleRestart = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "pause") return;

    togglePaused();
  };

  const handleReset = function () {
    if (!isTimerSet()) return;

    setTime(defaultTime);
    setPaused(false);
  };

  return (
    <form
      className={styles.container__timer}
      style={{
        backgroundColor: "rgb(255, 245, 199)",
        width: mediaContext === "mobile" ? "80%" : "90%",
        gap: "8%",
        boxShadow: "rgba(0, 0, 0, 0.267) 3px 3px 8px",
      }}
      data-timer={index}
      onSubmit={handleStart}
    >
      <audio loop ref={audioRef} src="/timerAlerm.mp3"></audio>
      <button
        className={styles.btn__timer}
        style={{
          position: "absolute",
          backgroundColor: "orange",
          width: mediaContext === "mobile" ? "7%" : "8%",
          aspectRatio: "1",
          top: mediaContext !== "tablet" ? "2%" : "1%",
          right: "1%",
          fontWeight: "bold",
          fontSize: `calc(${fontSize} * 0.9)`,
        }}
        type="button"
        onClick={() => {
          onClickDelete(index);
          handleStop();
        }}
      >
        &times;
      </button>
      <input
        style={{
          width: "80%",
          height: "16%",
          textAlign: "center",
          marginTop: "8%",
          borderRadius: "2% / 18%",
          borderColor: "orange",
          fontSize: fontSize,
        }}
        type="text"
        placeholder={language === "ja" ? "名前" : "Set a name"}
        value={title}
        onChange={handleChangeTitle}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: "3%",
          width: "80%",
          whiteSpace: "nowrap",
        }}
      >
        {!isTimerSet() ? (
          <>
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeInput }}
              name="hours"
              type="number"
              placeholder={language === "ja" ? "時間" : "h"}
              min="0"
              max="23"
              defaultValue={time.hours}
            />
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeInput }}
              name="minutes"
              type="number"
              placeholder={language === "ja" ? "分" : "min"}
              min="0"
              max="59"
              defaultValue={time.minutes}
            />
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeInput }}
              name="seconds"
              type="number"
              placeholder={language === "ja" ? "秒" : "sec"}
              min="0"
              max="59"
              defaultValue={time.seconds}
            />
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: `calc(${fontSize}* 1.7)`,
                letterSpacing: "0.07vw",
              }}
            >
              {time.hours} : {time.minutes} : {time.seconds}
            </span>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "100%",
          height: "fitContent",
          gap: "6%",
        }}
      >
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeBtn,
            backgroundColor: "greenyellow",
          }}
          type="submit"
          onClick={handleStop}
        >
          {!isTimerSet()
            ? language === "ja"
              ? "開始"
              : "Start"
            : language === "ja"
            ? "停止"
            : "Stop"}
        </button>
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeBtn,
            backgroundColor: "rgb(255, 153, 0)",
          }}
          type="button"
          onClick={(e) => {
            handlePause(e);
            handleRestart(e);
          }}
          value={!paused ? "pause" : "start"}
        >
          {!paused
            ? language === "ja"
              ? "一時停止"
              : "pause"
            : language === "ja"
            ? "開始"
            : "start"}
        </button>
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeBtn,
            backgroundColor: "rgb(191, 52, 255)",
          }}
          type="reset"
          onClick={handleReset}
        >
          {language === "ja" ? "リセット" : "Reset"}
        </button>
      </div>
    </form>
  );
}

function Memos({
  mediaContext,
  language,
  innerWidth,
  memoWidth,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  innerWidth: number;
  memoWidth: string;
}) {
  const fontSizeEn =
    mediaContext === "mobile"
      ? getSize(memoWidth, 0.047, "4vw")
      : mediaContext === "tablet"
      ? getSize(memoWidth, 0.07, "2.7vw")
      : mediaContext === "desktop" && innerWidth <= 1100
      ? getSize(memoWidth, 0.04, "1.5vw")
      : getSize(memoWidth, 0.03, "1.3vw");
  const fontSizeFinal =
    language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;

  return (
    <textarea
      style={{
        resize: "none",
        border: "none",
        backgroundImage:
          "linear-gradient(rgb(254, 255, 213), rgb(254, 255, 186))",
        width: "100%",
        overflowY: "auto",
        scrollbarColor: "rgb(255, 250, 209) rgb(255, 231, 92)",
        fontSize: fontSizeFinal,
        letterSpacing:
          mediaContext === "mobile" || mediaContext === "tablet"
            ? "0.1vw"
            : "0.05vw",
        padding: "2% 2.8%",
        zIndex: "1",
      }}
      contentEditable="true"
      placeholder={
        language === "ja"
          ? "このセクションは自由に使用してください！"
          : "Use this section for anything :)"
      }
    ></textarea>
  );
}
