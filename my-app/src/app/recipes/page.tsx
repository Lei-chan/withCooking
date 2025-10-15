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
      : mediaContext === "desktop" && window.innerWidth < 900
      ? 24
      : 30;
  const [numberOfUserRecipes, setNumberOfUserRecipes] = useState(0);
  const [recipes, setRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [curPageRecipes, setCurPageRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [numberOfPages, setNumberOfPages] = useState<number>(0);
  const [curPage, setCurPage] = useState<number>(1);

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

  useEffect(() => {
    setIsPending(true);
    if (!userContext?.recipes) return;

    const userRecipes = getRecipes();
    setNumberOfUserRecipes(userRecipes?.length || 0);
    setIsPending(false);
  }, [userContext?.recipes]);
  console.log(recipes);
  console.log(userContext?.recipes);

  //when curPage changes, change curRecipes too
  useEffect(() => {
    if (!recipes) return;

    const recipesPerPage = getRecipesPerPage(
      recipes,
      RECIPES_PER_PAGE,
      curPage
    );
    //set recipes for current page
    setCurPageRecipes(recipesPerPage);
  }, [curPage]);

  function getRecipes(keyword: string = "") {
    setIsPending(true);

    const structuredKeyword = keyword.toLowerCase().trim();
    const recipes = userContext?.recipes;
    if (!recipes) return [];

    const filteredRecipes = structuredKeyword
      ? getFilteredRecipes(recipes, structuredKeyword)
      : recipes;

    // const data = await getData(
    //   `/api/users/recipes${keyword ? `?keyword=${structuredKeyword}` : ""}`,
    //   {
    //     method: "GET",
    //     headers: { authorization: `Bearer ${userContext?.accessToken}` },
    //   }
    // );
    // console.log(data);

    // const orderedRecipes = getOrderedRecipes(data.data);
    setCurPage(1);
    setRecipes(filteredRecipes);
    setCurPageRecipes(getRecipesPerPage(filteredRecipes, RECIPES_PER_PAGE, 1));
    setNumberOfPages(calcNumberOfPages(filteredRecipes, RECIPES_PER_PAGE));

    setIsPending(false);
    return filteredRecipes;
  }

  async function handleSearchRecipes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = new FormData(e.currentTarget).get("input") as string;
    if (!value) return;

    //get recipe results
    // return getFilteredRecipes(recipes, value);
    getRecipes(value);
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
        numberOfCurRecipes={curPageRecipes?.length || 0}
        onSubmitSearch={handleSearchRecipes}
      />
      <RecipeContainer
        mediaContext={mediaContext}
        fontSize={fontSize}
        isPending={isPending}
        numberOfUserRecipes={numberOfUserRecipes}
        curPageRecipes={curPageRecipes}
        error={error}
      />
      <PaginationButtons
        mediaContext={mediaContext}
        fontSize={fontSize}
        styles={styles}
        curPage={curPage}
        numberOfPages={numberOfPages}
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
          name="input"
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
  numberOfUserRecipes,
  curPageRecipes,
  error,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  isPending: boolean;
  numberOfUserRecipes: number;
  curPageRecipes: TYPE_RECIPE[] | [];
  error: string;
}) {
  const NUMBER_OF_COLUMNS =
    mediaContext === "mobile"
      ? 1
      : mediaContext === "tablet" && window.innerWidth < 650
      ? 2
      : mediaContext === "tablet" && 650 <= window.innerWidth
      ? 3
      : mediaContext === "desktop" && window.innerWidth < 900
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
      getRecipesPerPage(curPageRecipes, RECIPES_PER_COLUMN, i + 1)
    );
  };

  useEffect(() => {
    setRecipesPerColumn(getRecipesPerColumn());
  }, [curPageRecipes]);

  useEffect(() => {
    const message = createMessage(
      error,
      isPending,
      numberOfUserRecipes,
      curPageRecipes.length
    ) as string;
    setMessage(message);
  }, [error, isPending, numberOfUserRecipes, curPageRecipes.length]);

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
      {recipesPerColumn[0].length ? (
        recipesPerColumn.map((recipes, i) => (
          <ul
            key={i}
            style={{
              width: "85%",
              height: "100%",
              zIndex: "1",
              // backgroundColor: "aqua",
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
      {recipe.mainImage?.data ? (
        <Image
          style={{ borderRadius: "50%" }}
          src={recipe.mainImage.data}
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

// function PaginationButtons({
//   styles,
//   curPage,
//   numberOfPages,
//   onClickPagination,
// }: {
//   styles: any;
//   curPage: number;
//   numberOfPages: number;
//   onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
// }) {
//   return (
//     <div className={styles.container__pagination}>
//       {curPage > 1 && (
//         <button
//           className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
//           value="decrease"
//           onClick={onClickPagination}
//         >
//           {`Page ${curPage - 1}`}
//           <br />
//           &larr;
//         </button>
//       )}
//       {numberOfPages > curPage && (
//         <button
//           className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
//           value="increase"
//           onClick={onClickPagination}
//         >
//           {`Page ${curPage + 1}`}
//           <br />
//           &rarr;
//         </button>
//       )}
//     </div>
//   );
// }
