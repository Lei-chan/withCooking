"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";
import {
  calcNumberOfPages,
  getFilteredRecipes,
  getRecipesPerPage,
  getTotalNumberOfRecipes,
  recipes,
} from "../helper";
import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { TYPE_RECIPE } from "../config";

export default function Recipes() {
  const RECIPES_PER_PAGE = 30;
  const [filteredRecipes, setFilteredRecipes] =
    useState<TYPE_RECIPE[]>(recipes);
  const [curRecipes, setCurRecipes] = useState<TYPE_RECIPE[]>(recipes);
  const [numberOfPages, setNumberOfPages] = useState<number>(
    getTotalNumberOfRecipes() / RECIPES_PER_PAGE
  );
  const [curPage, setCurPage] = useState<number>(1);

  function handleSearchRecipes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = e.currentTarget.querySelector("input")?.value;
    if (!value) return;

    //get recipe results
    const filteredRecipes = getFilteredRecipes(value);
    setFilteredRecipes(filteredRecipes);

    setNumberOfPages(calcNumberOfPages(filteredRecipes, RECIPES_PER_PAGE));

    const recipesPerPage = getRecipesPerPage(
      filteredRecipes,
      RECIPES_PER_PAGE,
      curPage
    );
    //set recipes for current page
    recipesPerPage && setCurRecipes(recipesPerPage);

    setCurPage(1);
  }

  function handlePagination(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;

    btn.value === "decrease"
      ? setCurPage((prev) => (prev === 1 ? prev : prev - 1))
      : setCurPage((prev) => (prev === numberOfPages ? prev : prev + 1));
  }

  //when curPage changes, change curRecipes too
  useEffect(() => {
    if (!filteredRecipes) return;

    const recipesPerPage = getRecipesPerPage(
      filteredRecipes,
      RECIPES_PER_PAGE,
      curPage
    );
    //set recipes for current page
    recipesPerPage && setCurRecipes(recipesPerPage);
  }, [curPage]);

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
        numberOfFilteredRecipes={filteredRecipes.length}
        numberOfCurRecipes={curRecipes.length}
        onSubmitSearch={handleSearchRecipes}
        // onChangeInput={handleSearchRecipes}
      />
      <RecipeContainer curRecipes={curRecipes} />
      <PaginationButtons
        curPage={curPage}
        numberOfPages={numberOfPages}
        onClickPagination={handlePagination}
      />
    </div>
  );
}

function SearchSection({
  numberOfCurRecipes,
  numberOfFilteredRecipes,
  onSubmitSearch,
}: // onChangeInput,
{
  numberOfCurRecipes: number;
  numberOfFilteredRecipes: number;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  // onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
      >{`${numberOfCurRecipes} / ${numberOfFilteredRecipes} results`}</p>
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

function RecipeContainer({ curRecipes }: { curRecipes: TYPE_RECIPE[] }) {
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
      {recipesPerColumn.map((recipes) => {
        if (!recipes) return;

        return (
          <ul key={nanoid()} style={{ width: "85%", height: "100%" }}>
            {recipes.map((_, i) => {
              return <RecipePreview key={nanoid()} recipe={recipes[i]} />;
            })}
          </ul>
        );
      })}
      <MessageContainer numberOfRecipes={curRecipes.length} />
    </div>
  );
}

function RecipePreview({ recipe }: { recipe: TYPE_RECIPE }) {
  function handleClickPreview() {
    const id = recipe.id;

    redirect(`/recipes/recipe#${id}`, RedirectType.replace);
  }

  return (
    <li className={styles.recipe_preview} onClick={handleClickPreview}>
      <img
        className={styles.img__main}
        src={recipe.mainImage || "/grey-img.png"}
        alt="main image"
      ></img>
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

function MessageContainer({ numberOfRecipes }: { numberOfRecipes: number }) {
  return (
    <div
      style={{
        position: "absolute",
        display: numberOfRecipes ? "none" : "flex",
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
      }}
    >
      {!getTotalNumberOfRecipes() ? (
        <p>
          No recipes created yet.
          <br />
          Let't start by creating a recipe :)
        </p>
      ) : (
        <p>
          No recipes found.
          <br />
          Please try with a different keyword :)
        </p>
      )}
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
