"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";
import { getData, getRecipesPerPage, getOrderedRecipes } from "../helper";
import React, { useContext, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { TYPE_RECIPE } from "../config";
import { AccessTokenContext } from "../context";

export default function Recipes() {
  const userContext = useContext(AccessTokenContext);
  const RECIPES_PER_PAGE = 30;
  const [recipes, setRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [curRecipes, setCurRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [numberOfPages, setNumberOfPages] = useState<number>(0);
  const [curPage, setCurPage] = useState<number>(1);

  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      await getRecipes();
      setIsPending(false);
    })();
  }, []);

  //when curPage changes, change curRecipes too
  useEffect(() => {
    if (!recipes) return;

    const recipesPerPage = getRecipesPerPage(
      recipes,
      RECIPES_PER_PAGE,
      curPage
    );
    //set recipes for current page
    setCurRecipes(recipesPerPage);
  }, [curPage]);

  async function getRecipes(
    // startIndex: number,
    // endIndex: number,
    keyword: string = ""
  ) {
    try {
      const structuredKeyword = keyword.toLowerCase().trim();
      const data = await getData(
        `/api/users/recipes${keyword ? `?keyword=${structuredKeyword}` : ""}`,
        {
          method: "GET",
          headers: { authorization: `Bearer ${userContext?.accessToken}` },
        }
      );
      console.log(data);

      const orderedRecipes = getOrderedRecipes(data.data);
      setCurPage(1);
      setRecipes(orderedRecipes);
      setCurRecipes(getRecipesPerPage(orderedRecipes, RECIPES_PER_PAGE, 1));
      setNumberOfPages(Math.ceil(orderedRecipes.length / RECIPES_PER_PAGE));
      data.newAccessToken && userContext?.login(data.newAccessToken);
      return orderedRecipes;
    } catch (err: any) {
      setError(`Server error while getting recipes 🙇‍♂️ ${err.message}`);
      console.error("Error while getting recipes", err.message);
    }
  }

  async function handleSearchRecipes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // const value = e.currentTarget.querySelector("input")?.value;
    const value = new FormData(e.currentTarget).get("input") as string;
    if (!value) return;

    //get recipe results
    await getRecipes(value);
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
        curPage={curPage}
        numberOfPages={numberOfPages}
        numberOfCurRecipes={curRecipes ? curRecipes.length : 0}
        onSubmitSearch={handleSearchRecipes}
      />
      <RecipeContainer
        isPending={isPending}
        totalUserRecipes={recipes.length}
        curRecipes={curRecipes}
        error={error}
      />
      <PaginationButtons
        curPage={curPage}
        numberOfPages={numberOfPages}
        onClickPagination={handlePagination}
      />
    </div>
  );
}

function SearchSection({
  curPage,
  numberOfPages,
  numberOfCurRecipes,
  onSubmitSearch,
}: {
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
        paddingLeft: "3%",
        width: "100%",
        height: "15%",
        gap: "4%",
      }}
    >
      <p
        style={{
          position: "absolute",
          width: "17%",
          height: "fit-content",
          left: "0",
          fontSize: "1.3vw",
          letterSpacing: "0.05vw",
          color: "rgb(172, 112, 0)",
          textAlign: "center",
        }}
      >{`${curPage} / ${numberOfPages} ${
        numberOfPages === 1 ? "page" : "pages"
      } (${numberOfCurRecipes} results)`}</p>
      <form
        className={styles.container__search}
        style={{
          width: "60%",
          height: "68%",
          borderRadius: "1% / 10%",
          gap: "3%",
        }}
        onSubmit={onSubmitSearch}
      >
        <input
          className={styles.input__search}
          type="search"
          name="input"
          placeholder="Search your recipe"
        />
        <button className={styles.btn__search} type="submit">
          Search
        </button>
      </form>
      <Link href={"http://localhost:3000/recipes/create"}>
        <button className={styles.btn__create} type="button">
          Create
        </button>
      </Link>
    </div>
  );
}

function RecipeContainer({
  isPending,
  totalUserRecipes,
  curRecipes,
  error,
}: {
  isPending: boolean;
  totalUserRecipes: number;
  curRecipes: TYPE_RECIPE[] | [];
  error: string;
}) {
  const NUMBER_OF_COLUMNS = 5;
  const RECIPES_PER_COLUMN = 6;

  //recipes for each column array[];
  const getRecipesPerColumn = () => {
    const recipesPerColumnArr = new Array(NUMBER_OF_COLUMNS).fill("");

    return recipesPerColumnArr.map((_, i) =>
      getRecipesPerPage(curRecipes, RECIPES_PER_COLUMN, i + 1)
    );
  };
  const recipesPerColumn = getRecipesPerColumn();

  function createMessage() {
    let message;

    if (isPending) {
      message = "Loading your recipes...";
    } else if (!totalUserRecipes) {
      message = "No recipes created yet. Let't start by creating a recipe :)";
    } else if (!curRecipes) {
      message =
        "No recipes found. Please try again with a different keyword :)";
    } else {
      message = error;
    }

    return message;
  }

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
        width: "90%",
        height: "73%",
        paddingTop: "3%",
        justifyItems: "center",
      }}
    >
      {recipesPerColumn.map((recipes, i) => (
        <ul key={i} style={{ width: "85%", height: "100%", zIndex: "1" }}>
          {recipes.map((_, i) => {
            return <RecipePreview key={i} recipe={recipes[i]} />;
          })}
        </ul>
      ))}
      <MessageContainer message={createMessage()} />
    </div>
  );
}

function RecipePreview({ recipe }: { recipe: any }) {
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
      {recipe.mainImage && (
        <Image
          style={{ borderRadius: "50%" }}
          src={recipe.mainImage.data}
          alt="main image"
          width={48}
          height={48}
        ></Image>
      )}
      <p className={styles.title}>{recipe.title}</p>
      {recipe.favorite && (
        <Image
          src="/star-on.png"
          alt="favorite icon"
          width={18}
          height={18}
        ></Image>
      )}
    </li>
  );
}

function MessageContainer({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "absolute",
        // display: numberOfRecipes ? "none" : "flex",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "3% 5% 0 5%",
        textAlign: "center",
        justifyContent: "center",
        fontSize: "2.1vw",
        letterSpacing: "0.1vw",
        wordSpacing: "0.3vw",
        color: "rgb(190, 124, 0)",
        zIndex: "0",
      }}
    >
      <p>{message}</p>
    </div>
  );
}

function PaginationButtons({
  curPage,
  numberOfPages,
  onClickPagination,
}: {
  curPage: number;
  numberOfPages: number;
  onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className={styles.container__pagination}>
      {curPage > 1 && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
          value="decrease"
          onClick={onClickPagination}
        >
          {`Page ${curPage - 1}`}
          <br />
          &larr;
        </button>
      )}
      {numberOfPages > curPage && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
          value="increase"
          onClick={onClickPagination}
        >
          {`Page ${curPage + 1}`}
          <br />
          &rarr;
        </button>
      )}
    </div>
  );
}
