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
  getData,
  getRecipesPerPage,
  getOrderedRecipes,
  getFilteredRecipes,
  calcNumberOfPages,
  getSize,
  getUserRecipes,
} from "@/app/lib/helper";
import React, { useContext, useEffect, useState } from "react";
import { TYPE_MEDIA, TYPE_RECIPE } from "../lib/config";
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

  // //set numberOfRecipes for the first render
  useEffect(() => {
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
        fontSize={fontSize}
        isPending={isPending}
        numberOfRecipes={numberOfRecipes}
        recipes={recipes}
        error={error}
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
          borderRadius: mediaContext === "mobile" ? "3% / 10%" : "1% / 10%",
          gap: "3%",
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
  fontSize,
  isPending,
  numberOfRecipes,
  recipes,
  error,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  isPending: boolean;
  numberOfRecipes: number | null;
  recipes: any[] | [];
  error: string;
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

  return (
    <div
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
    >
      {/* when there are no recipes => message, otherwise recipes */}
      {!isPending && !error && recipesPerColumn[0].length ? (
        recipesPerColumn.map((recipes, i) => (
          <ul
            key={i}
            style={{
              width: "85%",
              height: "100%",
              zIndex: "1",
              overflow: "hidden",
            }}
          >
            {recipes.map((recipe: TYPE_RECIPE, i: number) => {
              return (
                <RecipePreview
                  key={i}
                  mediaContext={mediaContext}
                  fontSize={fontSize}
                  recipe={recipe}
                />
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
    </div>
  );
}

function RecipePreview({
  mediaContext,
  fontSize,
  recipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  recipe: any;
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
