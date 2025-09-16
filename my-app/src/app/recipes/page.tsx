"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  calcNumberOfPages,
  getFilteredRecipes,
  getRecipesPerPage,
  getTotalNumberOfRecipes,
  recipes,
} from "../helper";
import { useEffect, useState } from "react";
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
    <div className={styles.page__recipes}>
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
    <div className={styles.container__search_btn}>
      <p
        className={styles.search_result}
      >{`${numberOfCurRecipes} / ${numberOfFilteredRecipes} results`}</p>
      <form className={styles.container__search} onSubmit={onSubmitSearch}>
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
    <div className={styles.container__recipes}>
      {recipesPerColumn.map((recipes) => {
        if (!recipes) return;

        return (
          <ul key={nanoid()} className={styles.container__recipes_column}>
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
  return (
    <li className={styles.recipe_preview}>
      <img
        className={styles.img__main}
        src={recipe.mainImage || "/grey-img.png"}
        alt="main image"
      ></img>
      <p className={styles.title}>{recipe.title}</p>
      {recipe.favorite && (
        <Image
          className={styles.img__favorite}
          src="/star-on.png"
          alt="favorite icon"
          width={512}
          height={512}
        ></Image>
      )}
    </li>
  );
}

function MessageContainer({ numberOfRecipes }: { numberOfRecipes: number }) {
  return (
    <div
      className={clsx(
        styles.container__message,
        numberOfRecipes && styles.hidden
      )}
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
    <div className={clsx(styles.container__pagination)}>
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
