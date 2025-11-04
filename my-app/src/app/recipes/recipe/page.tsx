"use client";
//react
import React, { useEffect, useState, useContext } from "react";
import clsx from "clsx";
//css
import styles from "./page.module.css";
//type
import { TYPE_RECIPE } from "@/app/lib/config/type";
//general methods
import { getData, getSize } from "@/app/lib/helpers/other";
//context
import { MediaContext, UserContext } from "@/app/lib/providers";
//components
import {
  Loading,
  LoadingRecipe,
  RecipeEdit,
  RecipeNoEdit,
} from "@/app/lib/components/components";
//library
import { nanoid } from "nanoid";

export default function Recipe() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE>();
  const [edit, setEdit] = useState(false);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  // ///design
  const recipeWidth =
    window.innerWidth *
      (mediaContext === "mobile"
        ? 0.9
        : mediaContext === "tablet"
        ? 0.7
        : 0.5) +
    "px";

  const fontSize =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.045, "4.5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.034, "2.7vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(recipeWidth, 0.031, "1.5vw")
      : getSize(recipeWidth, 0.028, "1.3vw");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    (async () => await getRecipe(id))();
  }, [edit]);

  async function getRecipe(id: string) {
    try {
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      setRecipe(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error(
        "Error while loading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  function handleToggleEdit() {
    setError("");
    setEdit(!edit);
  }

  return !isPending ? (
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
        height: "fit-content",
        padding:
          mediaContext === "mobile"
            ? "15% 0 5% 0"
            : mediaContext === "tablet"
            ? "10% 0 5% 0"
            : "2% 0",
      }}
    >
      {/* {(error || message) && (
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSize}
          error={error}
          message={message}
          mainOrRecipe="recipe"
        />
      )} */}
      {!recipe ? (
        <LoadingRecipe mediaContext={mediaContext} recipeWidth={recipeWidth} />
      ) : (
        <>
          {edit ? (
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
                  fontSize: `calc(${fontSize} * ${
                    mediaContext === "mobile" ? 1.4 : 1.3
                  })`,
                }}
                onClick={handleToggleEdit}
              >
                Recipe
              </button>
              <RecipeEdit
                recipe={recipe}
                error={error}
                createOrUpdate="update"
                handleChangeEdit={handleToggleEdit}
              />
            </>
          ) : (
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
                  fontSize: `calc(${fontSize} * ${
                    mediaContext === "mobile" ? 1.5 : 1.4
                  })`,
                }}
                type="button"
                onClick={handleToggleEdit}
              >
                Edit
              </button>
              <RecipeNoEdit
                mediaContext={mediaContext}
                userContext={userContext}
                recipeWidth={recipeWidth}
                error={error}
                mainOrRecipe="recipe"
                userRecipe={recipe}
              />
            </>
          )}
        </>
      )}
    </div>
  ) : (
    <Loading message="Updating your recipe..." />
  );
}
