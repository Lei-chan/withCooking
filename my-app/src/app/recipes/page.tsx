"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import {
  MessageContainer,
  PaginationButtons,
} from "@/app/lib/components/components";
import {
  createMessage,
  getRecipesPerPage,
  calcNumberOfPages,
  getUserRecipes,
  getData,
  wait,
} from "@/app/lib/helper";
import React, { useContext, useEffect, useState } from "react";
import { TYPE_MEDIA, TYPE_RECIPE, TYPE_USER_CONTEXT } from "../lib/config";
import { MediaContext, UserContext } from "../lib/providers";

export default function Recipes() {
  const mediaContext = useContext(MediaContext);
  console.log(mediaContext);
  const userContext = useContext(UserContext);
  const RECIPES_PER_PAGE =
    mediaContext === "mobile"
      ? 6
      : mediaContext === "tablet" && window.innerWidth < 650
      ? 12
      : mediaContext === "tablet" && 650 <= window.innerWidth
      ? 18
      : mediaContext === "tablet" && 650 > window.innerWidth
      ? 24
      : 30;
  const [numberOfRecipes, setNumberOfRecipes] = useState(
    userContext?.numberOfRecipes || null
  );
  const [recipes, setRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [numberOfPages, setNumberOfPages] = useState<number>(
    userContext?.numberOfRecipes
      ? calcNumberOfPages(userContext.numberOfRecipes, RECIPES_PER_PAGE)
      : 0
  );
  const [curPage, setCurPage] = useState<number>(1);
  const [keyword, setKeyword] = useState("");

  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState("");

  //design
  const innerWidth = window.innerWidth;
  const fontSize =
    mediaContext === "mobile"
      ? "4.5vw"
      : mediaContext === "tablet" && innerWidth < 650
      ? "3vw"
      : mediaContext === "tablet" && 650 <= innerWidth
      ? "2.5vw"
      : mediaContext === "desktop" && innerWidth < 900
      ? "2vw"
      : mediaContext === "desktop" && 900 <= innerWidth
      ? "1.5vw"
      : "1.2vw";

  function resetRecipes() {
    setRecipes([]);
    setCurPage(1);
  }

  // //set numberOfRecipes for the first render
  useEffect(() => {
    console.log(userContext?.numberOfRecipes);
    if (userContext?.numberOfRecipes === null || !userContext) return;
    setNumberOfRecipes(userContext.numberOfRecipes);
    setNumberOfPages(
      calcNumberOfPages(userContext.numberOfRecipes, RECIPES_PER_PAGE)
    );
    (async () => {
      setIsPending(true);
      await setUserRecipes();
      setIsPending(false);
    })();
  }, [userContext?.numberOfRecipes]);

  async function setUserRecipes(key: string = "") {
    try {
      //If user doesn't have any recipes => return
      if (!userContext?.numberOfRecipes) return;

      const data = await getUserRecipes(
        userContext?.accessToken,
        (curPage - 1) * RECIPES_PER_PAGE,
        RECIPES_PER_PAGE,
        key
      );

      setRecipes(data.data);
      setNumberOfRecipes(data.numberOfRecipes);
      setNumberOfPages(
        calcNumberOfPages(data.numberOfRecipes, RECIPES_PER_PAGE)
      );

      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err: any) {
      console.error("Error while getting recipes", err.message);
      setError("Server error while getting recipes 🙇‍♂️ Please retry again!");
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
        fontSize={fontSize}
        curPage={curPage}
        numberOfPages={numberOfPages}
        numberOfCurRecipes={recipes?.length || 0}
        onSubmitSearch={handleSearchRecipes}
      />
      <RecipeContainer
        mediaContext={mediaContext}
        userContext={userContext}
        fontSize={fontSize}
        isPending={isPending}
        numberOfRecipes={numberOfRecipes}
        recipes={recipes}
        error={error}
        displayPending={displayPending}
        displayError={displayError}
        resetRecipes={resetRecipes}
      />
      <PaginationButtons
        mediaContext={mediaContext}
        fontSize={fontSize}
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
  fontSize,
  curPage,
  numberOfPages,
  numberOfCurRecipes,
  onSubmitSearch,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  curPage: number;
  numberOfPages: number;
  numberOfCurRecipes: number;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
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
        numberOfPages === 1 ? "page" : "pages"
      } (${numberOfCurRecipes} results)`}</p>
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
          placeholder="Search your recipe"
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
          Search
        </button>
      </form>
      <Link href={"http://localhost:3000/recipes/create"}>
        <button
          className={styles.btn__create}
          style={{
            fontSize: `calc(${fontSize} * 0.9)`,
          }}
          type="button"
        >
          Create
        </button>
      </Link>
    </div>
  );
}

function RecipeContainer({
  mediaContext,
  userContext,
  fontSize,
  isPending,
  numberOfRecipes,
  recipes,
  error,
  displayPending,
  displayError,
  resetRecipes,
}: {
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  fontSize: string;
  isPending: boolean;
  numberOfRecipes: number | null;
  recipes: any[] | [];
  error: string;
  displayPending: (pendingOrNot: boolean) => void;
  displayError: (message: string) => void;
  resetRecipes: () => void;
}) {
  const NUMBER_OF_COLUMNS =
    mediaContext === "mobile"
      ? 1
      : mediaContext === "tablet" && window.innerWidth < 650
      ? 2
      : mediaContext === "tablet" && 650 <= window.innerWidth
      ? 3
      : mediaContext === "tablet" && 650 > window.innerWidth
      ? 4
      : 5;
  const RECIPES_PER_COLUMN = 6;
  const [recipesPerColumn, setRecipesPerColumn] = useState<any[]>(
    new Array(NUMBER_OF_COLUMNS).fill([])
  );
  const [message, setMessage] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[] | []>([]);

  //recipes for each column array[];
  const getRecipesPerColumn = () => {
    const recipesPerColumnArr = new Array(NUMBER_OF_COLUMNS).fill("");

    return recipesPerColumnArr.map((_, i) =>
      getRecipesPerPage(recipes, RECIPES_PER_COLUMN, i + 1)
    );
  };

  useEffect(() => {
    setRecipesPerColumn(getRecipesPerColumn());
  }, [recipes]);

  useEffect(() => {
    const message = createMessage(
      error,
      isPending,
      numberOfRecipes,
      recipes.length
    ) as string;
    setMessage(message);
  }, [error, isPending, numberOfRecipes, recipes.length]);

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
    } catch (err: any) {
      displayError("Server error while deleting recipe 🙇‍♂️ Please try again");
      console.error(
        "Error while deleting recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  return (
    <form
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${NUMBER_OF_COLUMNS}, 1fr)`,
        width: mediaContext === "mobile" ? "100%" : "90%",
        height: "73%",
        paddingTop:
          mediaContext === "mobile" || mediaContext === "tablet" ? "10%" : "3%",
        justifyItems: "center",
        // backgroundColor: "orange",
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
          // backgroundColor: "blue",
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
                ? "0.8%"
                : mediaContext === "tablet"
                ? "1%"
                : "2.5%",
          }}
          type="button"
          onClick={handleToggleSelectBtn}
        >
          {!isSelecting ? "Select Recipe" : "Stop Selecting"}
        </button>
      </div>
      {/* when there are no recipes => message, otherwise recipes */}
      {!isPending && !error && !message && recipesPerColumn[0].length ? (
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
              // backgroundColor: "blue",
            }}
          >
            {recipes.map((recipe: TYPE_RECIPE, i: number) => {
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
                    fontSize={fontSize}
                    recipe={recipe}
                    isSelecting={isSelecting}
                  />
                </div>
              );
            })}
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
    </form>
  );
}

function RecipePreview({
  mediaContext,
  fontSize,
  recipe,
  isSelecting,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  recipe: any;
  isSelecting: boolean;
}) {
  const mainImageSize = mediaContext === "mobile" ? "50px" : "46px";
  // const mainImageSize = "50px";

  function handleClickPreview(e: React.MouseEvent<HTMLElement>) {
    const id = e.currentTarget.id;

    redirect(`/recipes/recipe#${id}`, RedirectType.replace);
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
      {recipe.mainImagePreview?.data ? (
        <Image
          style={{ borderRadius: "50%" }}
          src={recipe.mainImagePreview.data}
          alt="main image"
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
          src="/star-on.png"
          alt="favorite icon"
          width={parseFloat(mainImageSize) / 3}
          height={parseFloat(mainImageSize) / 3}
        ></Image>
      )}
    </li>
  );
}
