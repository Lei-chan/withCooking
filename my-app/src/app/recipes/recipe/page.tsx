"use client";
//react
import React, { useEffect, useState, useContext, useRef } from "react";
import clsx from "clsx";
import Resizer from "react-image-file-resizer";
//next.js
import Image from "next/image";
//css
import styles from "./page.module.css";
//type
import {
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENT_UNIT,
  TYPE_INGREDIENTS,
  TYPE_INSTRUCTION,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
} from "@/app/lib/config/type";
//settings
import {
  MAX_SERVINGS,
  NUMBER_OF_TEMPERATURES,
} from "@/app/lib/config/settings";
//general methods
import { wait, getData, getSize } from "@/app/lib/helpers/other";
//methods for recipes
import {
  calcTransitionXSlider,
  updateIngsForServings,
  updateConvertion,
  getImageFileData,
  isRecipeAllowed,
  getIngGridTemplateColumnsStyle,
} from "@/app/lib/helpers/recipes";
//methods to convert
import { convertIngUnits } from "@/app/lib/helpers/converter";
//context
import { MediaContext, UserContext } from "@/app/lib/providers";
//components
import {
  BtnFavorite,
  ErrorMessageRecipe,
  Loading,
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
  //use curRecipe to modify the recipe value
  // const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
  // const [favorite, setFavorite] = useState<boolean>();
  const [edit, setEdit] = useState(false);
  // const [servingsValue, setServingsValue] = useState<number>();
  // const [regionUnit, setRegionUnit] = useState<TYPE_REGION_UNIT>("original");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  // const [message, setMessage] = useState("");

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

  // function setStateInit(recipeData: any) {
  //   setRecipe(recipeData);
  //   setCurRecipe(recipeData);
  //   setFavorite(recipeData.favorite);
  //   setServingsValue(recipeData.servings.servings);
  //   setRegionUnit("original");
  // }

  function handleToggleEdit() {
    setError("");
    setEdit(!edit);
  }

  // function displayError(error: string) {
  //   setError(error);
  // }

  // function handleChangeRegionUnit(e: React.ChangeEvent<HTMLSelectElement>) {
  //   const value = e.currentTarget.value as TYPE_REGION_UNIT;
  //   setRegionUnit(value);
  // }

  // function handleChangeMainImage(
  //   mainImageFile: TYPE_FILE,
  //   mainImagePreviewFile: TYPE_FILE
  // ) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;
  //     const newRecipe = { ...prev };
  //     newRecipe.mainImage = mainImageFile;
  //     newRecipe.mainImagePreview = mainImagePreviewFile;
  //     return newRecipe;
  //   });
  // }

  // function handleDeleteMainImage() {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;
  //     const newRecipe = { ...prev };
  //     newRecipe.mainImage = undefined;
  //     newRecipe.mainImagePreview = undefined;
  //     return newRecipe;
  //   });
  // }

  // function handleAddInstrucion() {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.instructions = [
  //       ...prev.instructions,
  //       { instruction: "", image: undefined },
  //     ];
  //     return newRecipe;
  //   });
  // }

  // function handleDeleteInstruciton(index: number) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.instructions = prev.instructions.toSpliced(index, 1);
  //     return newRecipe;
  //   });
  // }

  // function handleChangeInstruction(value: string, i: number) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.instructions[i].instruction = value;
  //     return newRecipe;
  //   });
  // }

  // function handleChangeInstructionImage(image: TYPE_FILE, index: number) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.instructions[index].image = image;
  //     return newRecipe;
  //   });
  // }

  // function handleDeleteInstructionImage(index: number) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.instructions[index].image = undefined;
  //     return newRecipe;
  //   });
  // }

  // function handleChangeMemoryImages(imagesArr: TYPE_FILE[]) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.memoryImages = [...prev.memoryImages, ...imagesArr];
  //     return newRecipe;
  //   });
  // }

  // function handleDeleteMemoryImage(index: number) {
  //   setCurRecipe((prev) => {
  //     if (!prev) return undefined;

  //     const newRecipe = { ...prev };
  //     newRecipe.memoryImages = prev.memoryImages.toSpliced(index, 1);
  //     return newRecipe;
  //   });
  // }

  // function handleClickFavorite() {
  //   setFavorite(!favorite);
  // }

  // async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   try {
  //     e.preventDefault();

  //     setError("");
  //     setIsPending(true);

  //     const formData = new FormData(e.currentTarget);
  //     const dataArr = [...formData];

  //     //filter out temp with no input
  //     const tempArr = [
  //       formData.get("temperature1"),
  //       formData.get("temperature2"),
  //       formData.get("temperature3"),
  //       formData.get("temperature4"),
  //     ]
  //       .filter((temp) => temp)
  //       .map((temp) => parseFloat(String(temp)));

  //     ///ingredients
  //     const numberOfIngredients = dataArr.filter(
  //       (arr) => arr[0].includes("ingredient") && arr[0].includes("Name")
  //     ).length;

  //     //filter out ingredient with no ingredinet or amount
  //     const ingredients = new Array(numberOfIngredients)
  //       .fill("")
  //       .map((_, i) => {
  //         const ingredient = String(
  //           formData.get(`ingredient${i + 1}Name`)
  //         )?.trim();

  //         const amount = +(formData.get(`ingredient${i + 1}Amount`) || 0);

  //         const unitData = formData.get(
  //           `ingredient${i + 1}Unit`
  //         ) as TYPE_INGREDIENT_UNIT;
  //         const customUnitData = String(
  //           formData.get(`ingredient${i + 1}CustomUnit`)
  //         )?.trim();

  //         const unit = unitData !== "other" ? unitData : customUnitData;

  //         return {
  //           id: undefined,
  //           ingredient,
  //           amount,
  //           unit,
  //           convertion: convertIngUnits(amount, unit),
  //         };
  //       })
  //       .filter((ing) => ing.ingredient || ing.amount);

  //     //filter out instruction with no instruction and image
  //     const instructions = curRecipe?.instructions.filter(
  //       (inst) => inst.instruction || inst.image
  //     ) as TYPE_INSTRUCTION[];

  //     const newRecipe = {
  //       _id: curRecipe?._id,
  //       favorite: favorite === true ? true : false,
  //       mainImage: curRecipe?.mainImage,
  //       mainImagePreview: curRecipe?.mainImagePreview,
  //       title: String(formData.get("title"))?.trim() || "",
  //       author: String(formData.get("author")).trim() || "",
  //       servings: {
  //         servings: +(formData.get("servings") || 0),
  //         unit: String(formData.get("servingsUnit")),
  //         customUnit: String(formData.get("servingsCustomUnit") || "").trim(),
  //       },
  //       temperatures: {
  //         temperatures: tempArr,
  //         unit:
  //           formData.get("temperatureUnit") === "℉" ? "℉" : ("℃" as "℉" | "℃"),
  //       },
  //       ingredients,
  //       preparation: String(formData.get("preparation")).trim(),
  //       instructions,
  //       description: String(formData.get("description"))?.trim() || "",
  //       memoryImages: curRecipe?.memoryImages as TYPE_FILE[] | [],
  //       comments: String(formData.get("comments"))?.trim() || "",
  //       createdAt: curRecipe?.createdAt,
  //       updatedAt: new Date().toISOString(),
  //     };

  //     if (!isRecipeAllowed(newRecipe)) {
  //       const err: any = new Error("Please fill more than one input field!");
  //       err.statusCode = 400;
  //       throw err;
  //     }

  //     const recipeData = await uploadRecipe(newRecipe, userContext);
  //     setStateInit(recipeData);

  //     setIsPending(false);
  //     setEdit(false);
  //     setMessage("Recipe uploaded successfully :)");
  //     await wait();
  //     setMessage("");
  //   } catch (err: any) {
  //     setIsPending(false);
  //     setError(
  //       `Server error while uploading recipe 🙇‍♂️ ${
  //         err.statusCode === 400 ? err.message : "Please try again this later"
  //       }`
  //     );
  //     console.error(
  //       "Error while uploading recipe",
  //       err.message,
  //       err.statusCode || 500
  //     );
  //   }
  // }

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
        <form
          className={styles.loading}
          style={{
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: recipeWidth,
            aspectRatio: "1/1.5",
            boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
            borderRadius: mediaContext === "mobile" ? "5px" : "10px",
          }}
        ></form>
      ) : (
        <>
          {edit ? (
            <>
              <button
                className={clsx(styles.btn__img, styles.btn__edit)}
                style={{
                  color: "blueviolet",
                  backgroundImage: "url(/recipes.svg)",
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
                  backgroundImage: "url(/pencile.svg)",
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
