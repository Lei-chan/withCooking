"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Resizer from "react-image-file-resizer";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";
import React, { useEffect, useState, useContext } from "react";
import { MediaContext, UserContext } from "@/app/lib/providers";
import {
  wait,
  getData,
  uploadRecipe,
  getFileData,
  getTemperatures,
  // getUnit,
  getRegion,
  convertIngUnits,
  convertTempUnits,
  getReadableIngUnit,
  calcTransitionXSlider,
  updateIngsForServings,
  updateConvertion,
  getNextSlideIndex,
  getImageFileData,
  isRecipeAllowed,
  getSize,
} from "@/app/lib/helper";
import {
  MAX_SERVINGS,
  NUMBER_OF_TEMPERATURES,
  SLIDE_TRANSITION_SEC,
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENT_UNIT,
  TYPE_INGREDIENTS,
  TYPE_INSTRUCTION,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
} from "@/app/lib/config";
import { nanoid } from "nanoid";
import fracty from "fracty";
import { Loading } from "@/app/lib/components/components";

export default function Recipe() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE>();
  //use curRecipe to modify the recipe value
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
  const [favorite, setFavorite] = useState<boolean>();
  const [edit, setEdit] = useState(false);
  const [servingsValue, setServingsValue] = useState<number>();
  const [regionUnit, setRegionUnit] = useState<TYPE_REGION_UNIT>("original");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  ///design
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

  const headerSize =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.055, "5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.04, "3.5vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(recipeWidth, 0.035, "1.5vw")
      : getSize(recipeWidth, 0.032, "1.3vw");

  const marginTop = getSize(recipeWidth, 0.11, "30px");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    (async () => await getRecipe(id))();
  }, [edit]);

  async function getRecipe(id: string) {
    try {
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      setStateInit(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error(
        "Error while loading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  function setStateInit(recipeData: any) {
    //recipe is stored inside _doc of data.data
    //images are stored in data.data
    const recipe = { ...recipeData._doc };
    recipe.mainImage = recipeData.mainImage;
    recipe.instructions = recipeData.instructions;
    recipe.memoryImages = recipeData.memoryImages;

    setRecipe(recipe);
    setCurRecipe(recipe);
    setFavorite(recipe.favorite);
    setServingsValue(recipe.servings.servings);
    setRegionUnit("original");
  }

  function handleToggleEdit() {
    setError("");
    setMessage("");
    setEdit(!edit);
  }

  function displayError(error: string) {
    setError(error);
  }

  //only when edit is false
  function handleChangeServings(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);

    if (edit || !recipe) return;
    setCurRecipe((prev: any) => {
      const newRecipe = { ...recipe };
      newRecipe.ingredients = updateIngsForServings(newValue, recipe);
      //update convertion for updated ing amount
      return updateConvertion(newRecipe);
    });
  }

  function handleChangeRegionUnit(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value as TYPE_REGION_UNIT;
    setRegionUnit(value);
  }

  function handleChangeMainImage(
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;
      const newRecipe = { ...prev };
      newRecipe.mainImage = mainImageFile;
      newRecipe.mainImagePreview = mainImagePreviewFile;
      return newRecipe;
    });
  }

  function handleDeleteMainImage() {
    setCurRecipe((prev) => {
      if (!prev) return undefined;
      const newRecipe = { ...prev };
      newRecipe.mainImage = undefined;
      newRecipe.mainImagePreview = undefined;
      return newRecipe;
    });
  }

  function handleAddInstrucion() {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.instructions = [
        ...prev.instructions,
        { instruction: "", image: undefined },
      ];
      return newRecipe;
    });
  }

  function handleDeleteInstruciton(index: number) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.instructions = prev.instructions.toSpliced(index, 1);
      return newRecipe;
    });
  }

  function handleChangeInstruction(value: string, i: number) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.instructions[i].instruction = value;
      return newRecipe;
    });
  }

  function handleChangeInstructionImage(image: TYPE_FILE, index: number) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.instructions[index].image = image;
      return newRecipe;
    });
  }

  function handleDeleteInstructionImage(index: number) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.instructions[index].image = undefined;
      return newRecipe;
    });
  }

  function handleChangeMemoryImages(imagesArr: TYPE_FILE[]) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.memoryImages = [...prev.memoryImages, ...imagesArr];
      return newRecipe;
    });
  }

  function handleDeleteMemoryImage(index: number) {
    setCurRecipe((prev) => {
      if (!prev) return undefined;

      const newRecipe = { ...prev };
      newRecipe.memoryImages = prev.memoryImages.toSpliced(index, 1);
      return newRecipe;
    });
  }

  async function handleClickFavorite() {
    try {
      setError("");
      setMessage("Updating favorite status...");
      setFavorite(!favorite);

      if (!recipe) return;

      const newRecipe = { ...recipe };
      newRecipe.favorite = !favorite;

      await uploadRecipe(newRecipe, userContext);
      setMessage("Favorite status updated successfully!");
      await wait();
      setMessage("");
    } catch (err: any) {
      setMessage("");
      setError(`Server error while uploading recipe 🙇‍♂️ ${err.message}`);
      console.error(
        "Error while uploading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      setError("");
      setIsPending(true);

      const formData = new FormData(e.currentTarget);
      const dataArr = [...formData];

      //filter out temp with no input
      const tempArr = [
        formData.get("temperature1"),
        formData.get("temperature2"),
        formData.get("temperature3"),
        formData.get("temperature4"),
      ]
        .filter((temp) => temp)
        .map((temp) => parseFloat(String(temp)));

      ///ingredients
      const numberOfIngredients = dataArr.filter(
        (arr) => arr[0].includes("ingredient") && arr[0].includes("Name")
      ).length;

      //filter out ingredient with no ingredinet or amount
      const ingredients = new Array(numberOfIngredients)
        .fill("")
        .map((_, i) => {
          const ingredient = String(
            formData.get(`ingredient${i + 1}Name`)
          )?.trim();

          const amount = +(formData.get(`ingredient${i + 1}Amount`) || 0);

          const unitData = formData.get(
            `ingredient${i + 1}Unit`
          ) as TYPE_INGREDIENT_UNIT;
          const customUnitData = String(
            formData.get(`ingredient${i + 1}CustomUnit`)
          )?.trim();

          const unit = unitData !== "other" ? unitData : customUnitData;

          return {
            id: undefined,
            ingredient,
            amount,
            unit,
            convertion: convertIngUnits(amount, unit),
          };
        })
        .filter((ing) => ing.ingredient || ing.amount);

      //filter out instruction with no instruction and image
      const instructions = curRecipe?.instructions.filter(
        (inst) => inst.instruction || inst.image
      ) as TYPE_INSTRUCTION[];

      const newRecipe = {
        favorite: favorite === true ? true : false,
        mainImage: curRecipe?.mainImage,
        mainImagePreview: curRecipe?.mainImagePreview,
        title: String(formData.get("title"))?.trim() || "",
        author: String(formData.get("author")).trim() || "",
        region: getRegion(ingredients),
        servings: {
          servings: +(formData.get("servings") || 0),
          unit: String(formData.get("servingsUnit")) || "people",
          customUnit: String(formData.get("servingsCustomUnit")).trim() || "",
        },
        temperatures: {
          temperatures: tempArr,
          unit:
            formData.get("temperatureUnit") === "℉" ? "℉" : ("℃" as "℉" | "℃"),
        },
        ingredients,
        instructions,
        description: String(formData.get("description"))?.trim() || "",
        memoryImages: curRecipe?.memoryImages as TYPE_FILE[] | [],
        comments: String(formData.get("comments"))?.trim() || "",
        createdAt: new Date().toISOString(),
      };

      if (!isRecipeAllowed(newRecipe)) {
        setIsPending(false);
        setError("Please fill more than one input field!");
        return;
      }

      const recipeData = await uploadRecipe(newRecipe, userContext);
      setStateInit(recipeData);

      setIsPending(false);
      setEdit(false);
      setMessage("Recipe uploaded successfully :)");
      await wait();
      setMessage("");
    } catch (err: any) {
      setIsPending(false);
      setError(`Server error while uploading recipe 🙇‍♂️ ${err.message}`);
      console.error(
        "Error while uploading recipe",
        err.message,
        err.statusCode || 500
      );
    }
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
      {(error || message) && (
        <p
          style={{
            backgroundColor: error ? "orangered" : "rgba(112, 231, 0, 1)",
            padding: mediaContext === "mobile" ? "1.5% 2%" : "0.7% 1%",
            borderRadius: "5px",
            fontSize: `calc(${fontSize} * 1.1)`,
            letterSpacing: "0.07vw",
            marginBottom: mediaContext === "mobile" ? "2%" : "1%",
            color: "white",
          }}
        >
          {error || message}
        </p>
      )}
      {!recipe ||
      !curRecipe ||
      servingsValue === undefined ||
      !regionUnit ||
      favorite === undefined ? (
        <form
          className={styles.loading}
          style={{
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            // width: "50%",
            // height: "600px",
            width: recipeWidth,
            aspectRatio: "1/1.5",
            boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
            borderRadius: mediaContext === "mobile" ? "5px" : "10px",
          }}
        ></form>
      ) : (
        <>
          {!edit ? (
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
          ) : (
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
          )}
          <form
            style={{
              position: "relative",
              textAlign: "center",
              backgroundImage:
                "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
              width: recipeWidth,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: mediaContext === "mobile" ? "6% 0" : "3% 0",
              color: "rgb(60, 0, 116)",
              boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
              borderRadius: mediaContext === "mobile" ? "5px" : "10px",
            }}
            onSubmit={handleSubmit}
          >
            <ImageTitle
              mediaContext={mediaContext}
              recipeWidth={recipeWidth}
              fontSize={fontSize}
              edit={edit}
              image={curRecipe.mainImage}
              title={curRecipe.title}
              onChangeImage={handleChangeMainImage}
              deleteImage={handleDeleteMainImage}
              displayError={displayError}
            />
            <BriefExplanation
              mediaContext={mediaContext}
              recipeWidth={recipeWidth}
              fontSize={fontSize}
              edit={edit}
              curRecipe={curRecipe}
              originalServingsValue={recipe.servings.servings}
              curServingsValue={servingsValue}
              regionUnit={regionUnit}
              favorite={favorite}
              onChangeServings={handleChangeServings}
              onChangeRegionUnit={handleChangeRegionUnit}
              onClickFavorite={handleClickFavorite}
            />
            <Ingredients
              mediaContext={mediaContext}
              fontSize={fontSize}
              headerSize={headerSize}
              edit={edit}
              servingsValue={servingsValue}
              ingredients={curRecipe.ingredients}
              regionUnit={regionUnit}
            />
            <Instructions
              mediaContext={mediaContext}
              recipeWidth={recipeWidth}
              fontSize={fontSize}
              headerSize={headerSize}
              marginTop={marginTop}
              edit={edit}
              instructions={curRecipe.instructions}
              addInstruction={handleAddInstrucion}
              deleteInstruction={handleDeleteInstruciton}
              onChangeInstruction={handleChangeInstruction}
              onChangeImage={handleChangeInstructionImage}
              deleteImage={handleDeleteInstructionImage}
              displayError={displayError}
            />
            <AboutThisRecipe
              mediaContext={mediaContext}
              fontSize={fontSize}
              headerSize={headerSize}
              marginTop={marginTop}
              edit={edit}
              curRecipe={curRecipe}
            />
            <Memories
              mediaContext={mediaContext}
              recipeWidth={recipeWidth}
              fontSize={fontSize}
              headerSize={headerSize}
              marginTop={marginTop}
              edit={edit}
              images={curRecipe.memoryImages}
              onChangeImages={handleChangeMemoryImages}
              deleteImage={handleDeleteMemoryImage}
              displayError={displayError}
            />
            <Comments
              mediaContext={mediaContext}
              fontSize={fontSize}
              headerSize={headerSize}
              marginTop={marginTop}
              edit={edit}
              curRecipe={curRecipe}
            />

            {/* <div className={styles.container__nutrition_facts}>
          <div className={styles.nutrition_facts}>
            <div className={styles.container__h3_input}>
              <h3>Nutrition Facts</h3>
              <input
                id={styles.input__servings}
                type="number"
                min="1"
                max="500"
                defaultValue="1"
              ></input>
              <span>servings</span>
            </div>
            <table className={styles.nutrients}>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                  <th scope="col">
                    Recommended amount a day
                    <br />
                    (Adult Men/Adult Women)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Calories</th>
                  <td scope="row">300kcal(1000jl)/30%</td>
                  <td scope="row">15%</td>
                </tr>
                <tr>
                  <th scope="row">Carbs</th>
                  <td scope="row">100g/30%</td>
                  <td scope="row">20%</td>
                </tr>
                <tr>
                  <th scope="row">Protein</th>
                  <td scope="row">10g/4%</td>
                  <td scope="row">10%</td>
                </tr>
                <tr>
                  <th scope="row">Fat</th>
                  <td scope="row">20g/10%</td>
                  <td scope="row">70%</td>
                </tr>
                <tr>
                  <th scope="row">Sugar</th>
                  <td scope="row">20g/10%</td>
                  <td scope="row">70%</td>
                </tr>
                <tr>
                  <th scope="row">Sodium</th>
                  <td scope="row">2g/0.5%</td>
                  <td scope="row">10%/20%</td>
                </tr>
                <tr>
                  <th scope="row">Fibers</th>
                  <td scope="row">2g/0.5%</td>
                  <td scope="row">10%/20%</td>
                </tr>
              </tbody>
            </table>
            <p style={{ color: "red", width: "95%", marginTop: "2%" }}>
                ※ Couldn't find the information of aaaa, and aaa, so that is
                excluded here.
              </p> 
          </div>
        </div> */}
            {edit && (
              <button
                className={styles.btn__upload_recipe}
                style={{ fontSize: headerSize, marginTop: headerSize }}
                type="submit"
              >
                Upload
              </button>
            )}
          </form>
        </>
      )}
    </div>
  ) : (
    <Loading message="Updating your recipe..." />
  );
}

function ImageTitle({
  mediaContext,
  recipeWidth,
  fontSize,
  edit,
  image,
  title,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  edit: boolean;
  image: TYPE_FILE | undefined;
  title: string;
  onChangeImage: (
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) => void;
  deleteImage: () => void;
  displayError: (error: string) => void;
}) {
  const [recipeTitle, setRecipeTitle] = useState(title);

  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.82, "250px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.74, "400px")
      : getSize(recipeWidth, 0.7, "440px");
  const height =
    parseInt(width) *
      (mediaContext === "mobile"
        ? 0.65
        : mediaContext === "tablet"
        ? 0.63
        : 0.6) +
    "px";

  async function handleChangeImage(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      const mainImageFile = (await new Promise((resolve) =>
        Resizer.imageFileResizer(
          files[0],
          440,
          264,
          "WEBP",
          100,
          0,
          (uri) => resolve(getImageFileData(files[0], uri)),
          "base64"
        )
      )) as TYPE_FILE;

      const mainImagePreviewFile = (await new Promise((resolve) =>
        Resizer.imageFileResizer(
          files[0],
          50,
          50,
          "WEBP",
          100,
          0,
          (uri) => resolve(getImageFileData(files[0], uri)),
          "base64"
        )
      )) as TYPE_FILE;

      onChangeImage(mainImageFile, mainImagePreviewFile);
    } catch (err: any) {
      console.error("Error while resizing main image", err.message);
      displayError("Server error while uploading image 🙇‍♂️ Please try again!");
    }
  }

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setRecipeTitle(value);
  }

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      {!image?.data ? (
        <div className={styles.grey_background} style={{ width, height }}>
          {edit && (
            <div
              style={{
                position: "relative",
                width:
                  mediaContext === "mobile" || mediaContext === "tablet"
                    ? "60%"
                    : "50%",
                height: "13%",
                left: "4%",
                bottom: "3%",
              }}
            >
              <button
                className={clsx(styles.btn__img, styles.btn__upload_img)}
                style={{
                  width: "100%",
                  height: "100%",
                  left: "0",
                  color: "rgba(255, 168, 7, 1)",
                  fontWeight: "bold",
                  fontSize,
                  letterSpacing: "0.05vw",
                }}
                type="button"
              >
                Upload image
              </button>
              <input
                className={styles.input__file}
                style={{
                  width: "100%",
                  height: "100%",
                  left: "0",
                }}
                type="file"
                accept="image/*"
                name="mainImage"
                onChange={handleChangeImage}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {edit && (
            <button
              className={clsx(styles.btn__img, styles.btn__trash_img)}
              style={{
                top: mediaContext === "mobile" ? "102%" : "0",
                right: mediaContext === "mobile" ? "-5%" : "-8%",
                width: mediaContext === "mobile" ? "10%" : "7%",
                height: mediaContext === "mobile" ? "11%" : "9%",
              }}
              type="button"
              onClick={deleteImage}
            ></button>
          )}
          <Image
            src={image.data}
            alt="main image"
            width={parseFloat(width)}
            height={parseFloat(height)}
          ></Image>
        </>
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          top: "-10%",
          left: "7%",
          width: "85%",
          minHeight: `calc(${fontSize} * 2)`,
          maxHeight: "fit-content",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          backgroundImage:
            "linear-gradient(150deg, rgb(255, 230, 0) 10%,rgb(255, 102, 0))",
          padding: "2% 3.5%",
          transform: "skewX(-17deg)",
          zIndex: "2",
        }}
      >
        {edit ? (
          <input
            style={{
              width: "100%",
              height: "100%",
              background: "none",
              border: "none",
              letterSpacing: "0.07vw",
              fontSize: `calc(${fontSize} * 1.5)`,
              textAlign: "center",
            }}
            name="title"
            placeholder="Click here to set title"
            value={recipeTitle}
            onChange={handleChangeTitle}
          ></input>
        ) : (
          <p
            style={{
              width: "100%",
              height: "100%",
              fontSize: `calc(${fontSize} * 1.5)`,
              letterSpacing: "0.1vw",
              textAlign: "center",
            }}
          >
            {recipeTitle}
          </p>
        )}
      </div>
    </div>
  );
}

function BriefExplanation({
  mediaContext,
  recipeWidth,
  fontSize,
  edit,
  curRecipe,
  originalServingsValue,
  curServingsValue,
  regionUnit,
  favorite,
  onChangeServings,
  onChangeRegionUnit,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  edit: boolean;
  curRecipe: TYPE_RECIPE;
  originalServingsValue: number;
  curServingsValue: number;
  regionUnit: TYPE_REGION_UNIT;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRegionUnit: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [author, setAuthour] = useState(curRecipe.author);
  const [servingsUnit, setServingsUnit] = useState(curRecipe.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe.servings.customUnit
  );
  const [tempKeys, setTempKeys] = useState(
    Array(NUMBER_OF_TEMPERATURES)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
  );
  const [temperaturs, setTemperatures] = useState(
    curRecipe.temperatures.temperatures.join(" / ")
  );
  const [temperatureUnit, setTemperatureUnit] = useState<"℉" | "℃">(
    curRecipe.temperatures.unit
  );

  //design
  const width = getSize(recipeWidth, 0.9, "90%");
  const fontSizeBrief = parseFloat(fontSize) * 0.95 + "px";
  const iconSize = parseFloat(fontSizeBrief);
  const fontFukidashiSize = `calc(${fontSizeBrief} * 0.9)`;

  function handleMouseOver(e: React.MouseEvent<HTMLDivElement>) {
    const index = e.currentTarget.dataset.icon;
    if (!index) return;

    setMouseOver((prev) => {
      const newMouseOver = [...prev];
      newMouseOver[+index] = true;
      return newMouseOver;
    });
  }

  function handleMouseOut(e: React.MouseEvent<HTMLDivElement>) {
    const index = e.currentTarget.dataset.icon;
    if (!index) return;

    setMouseOver((prev) => {
      const newMouseOver = [...prev];
      newMouseOver[+index] = false;
      return newMouseOver;
    });
  }

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;
    const value = target.value;

    if (target.name === "author") setAuthour(value);
    if (target.name === "servingsUnit") setServingsUnit(value);
    if (target.name === "servingsCustomUnit") setServingsCustomUnit(value);
    if (target.name === "temperatureUnit") {
      (value === "℉" || value === "℃") && handleChangeTempUnit(value);
    }
  }

  function handleChangeTempUnit(value: "℉" | "℃") {
    setTemperatureUnit(value);
  }

  useEffect(() => {
    setAuthour(curRecipe.author);
    setServingsUnit(curRecipe.servings.unit);
    setServingsCustomUnit(curRecipe.servings.customUnit);
    setTemperatures(curRecipe.temperatures.temperatures.join(" / "));
    setTemperatureUnit(curRecipe.temperatures.unit);
  }, [edit, curRecipe]);

  useEffect(() => {
    const newTemps = getTemperatures(
      curRecipe.temperatures.temperatures,
      curRecipe.temperatures.unit,
      temperatureUnit
    );
    setTemperatures(newTemps);
  }, [temperatureUnit]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: "fit-content",
        // aspectRatio: "1/0.1",
        gap: "3%",
        margin:
          mediaContext === "mobile"
            ? "10% 0 5% 0"
            : mediaContext === "tablet"
            ? "8% 0 5% 0"
            : "7% 0 5% 0 ",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          minWidth: "80%",
          width: "fit-content",
          maxWidth: "91%",
          height: "100%",
          whiteSpace: "nowrap",
          padding:
            mediaContext === "mobile"
              ? "5% 3%"
              : mediaContext === "tablet"
              ? "4% 3%"
              : "3%",
          backgroundColor: "rgb(255, 217, 0)",
          borderRadius: "1% / 7%",
          gap: "20%",
          boxShadow: "rgba(0, 0, 0, 0.27) 3px 3px 5px",
        }}
      >
        {mediaContext === "mobile" && edit && (
          <>
            <div
              className={styles.container__author_servings}
              style={{ gap: "3%" }}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: "-280%",
                  left: "-13%",
                  opacity: !mouseOver[0] ? 0 : 1,
                  width: "45%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{
                    fontSize: fontFukidashiSize,
                  }}
                >
                  Name of the person who will make the recipe
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="0"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/person.svg"}
                  alt="person icon"
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <input
                className={styles.input__brief_explanation}
                style={{ width: "35%", fontSize }}
                name="author"
                placeholder="Author"
                value={author}
                onChange={handleChangeInput}
              ></input>
            </div>
            <div
              className={styles.container__author_servings}
              style={{ gap: "3%" }}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: "-420%",
                  left: "-13%",
                  opacity: !mouseOver[1] ? 0 : 1,
                  width: "70%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  Number of servings. If there isn't a unit you want to use in
                  the selector, please select other and fill custom unit.
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="1"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/servings.svg"}
                  alt="servings icon"
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <input
                className={styles.input__brief_explanation}
                style={{ width: "35%", fontSize }}
                type="number"
                min="1"
                max={MAX_SERVINGS}
                name="servings"
                placeholder="Servings"
                value={curServingsValue}
                onChange={onChangeServings}
              />
              <select
                className={styles.input__brief_explanation}
                style={{ width: "40%", fontSize }}
                name="servingsUnit"
                onChange={handleChangeInput}
              >
                <option value="people">people</option>
                <option value="slices">slices</option>
                <option value="pieces">pieces</option>
                <option value="cups">cups</option>
                <option value="bowls">bowls</option>
                <option value="other">other</option>
              </select>
              {servingsUnit === "other" && (
                <input
                  className={styles.input__brief_explanation}
                  style={{ width: "25%", fontSize }}
                  name="servingsCustomUnit"
                  placeholder="custom"
                />
              )}
            </div>
          </>
        )}
        {mediaContext !== "mobile" && edit && (
          <div
            className={styles.container__author_servings}
            style={{ gap: "2%" }}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                top: "-295%",
                left: "-13%",
                opacity: !mouseOver[0] ? 0 : 1,
                width: mediaContext === "tablet" ? "38%" : "34%",
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{
                  fontSize: fontFukidashiSize,
                }}
              >
                Name of the person who will make the recipe
              </p>
            </div>
            <div
              className={styles.icons__brief_explanation}
              data-icon="0"
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <Image
                src={"/person.svg"}
                alt="person icon"
                width={iconSize}
                height={iconSize}
              ></Image>
            </div>
            <input
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "23%" : "19%",
                fontSize,
              }}
              name="author"
              placeholder="Author"
              value={author}
              onChange={handleChangeInput}
            ></input>
            <div
              className={styles.icons__brief_explanation}
              data-icon="1"
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: mediaContext === "tablet" ? "-370%" : "-350%",
                  left: "10%",
                  opacity: !mouseOver[1] ? 0 : 1,
                  width: mediaContext === "tablet" ? "50.5%" : "42%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  Number of servings. If there isn't a unit you want to use in
                  the selector, please select other and fill custom unit.
                </p>
              </div>
              <Image
                src={"/servings.svg"}
                alt="servings icon"
                width={iconSize}
                height={iconSize}
              ></Image>
            </div>
            <input
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "25%" : "17%",
                fontSize,
              }}
              type="number"
              min="1"
              max={MAX_SERVINGS}
              name="servings"
              placeholder="Servings"
              value={curServingsValue}
              onChange={onChangeServings}
            />
            <select
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "25%" : "22%",
                fontSize,
              }}
              name="servingsUnit"
              onChange={handleChangeInput}
            >
              <option value="people">people</option>
              <option value="slices">slices</option>
              <option value="pieces">pieces</option>
              <option value="cups">cups</option>
              <option value="bowls">bowls</option>
              <option value="other">other</option>
            </select>
            {servingsUnit === "other" && (
              <input
                className={styles.input__brief_explanation}
                style={{ width: "20%", fontSize }}
                name="servingsCustomUnit"
                placeholder={
                  mediaContext === "tablet" ? "custom" : "custom unit"
                }
              />
            )}
          </div>
        )}
        {edit && (
          <div className={styles.container__units} style={{ gap: "2%" }}>
            <div
              className={styles.container__fukidashi}
              style={{
                top:
                  mediaContext === "mobile"
                    ? "-290%"
                    : mediaContext === "tablet"
                    ? "-295%"
                    : "-290%",
                left: "-13%",
                opacity: !mouseOver[2] ? 0 : 1,
                width:
                  mediaContext === "mobile"
                    ? "54%"
                    : mediaContext === "tablet"
                    ? "40.5%"
                    : "34.5%",
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ fontSize: fontFukidashiSize }}
              >
                Temperatures you use in the recipe (e.g. oven temperatures)
              </p>
            </div>
            <div
              className={styles.icons__brief_explanation}
              style={{ marginRight: "1%" }}
              data-icon="2"
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <Image
                src={"/temperature.svg"}
                alt="ingredient units icon"
                width={iconSize}
                height={iconSize}
              ></Image>
            </div>
            {tempKeys.map((keyObj, i) => (
              <InputTemp
                key={keyObj.id}
                mediaContext={mediaContext}
                fontSize={fontSize}
                fontSizeBrief={fontSizeBrief}
                edit={edit}
                temperature={curRecipe.temperatures.temperatures[i]}
                temperatureUnit={temperatureUnit}
                i={i}
              />
            ))}
            <select
              className={styles.input__brief_explanation}
              style={{
                width: "fit-content",
                fontSize: mediaContext === "mobile" ? fontSize : fontSizeBrief,
              }}
              name="temperatureUnit"
              value={temperatureUnit}
              onChange={handleChangeInput}
            >
              <option value="℃">℃</option>
              <option value="℉">℉</option>
            </select>
          </div>
        )}

        {!edit && (
          <>
            <div
              className={styles.container__author_servings}
              style={{
                gap: mediaContext === "mobile" ? "4%" : "2%",
                marginBottom: "2%",
              }}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: mediaContext === "mobile" ? "-275%" : "-295%",
                  left: "-13%",
                  opacity: !mouseOver[0] ? 0 : 1,
                  width: "45%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{
                    fontSize: fontFukidashiSize,
                  }}
                >
                  Author of the recipe
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="0"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/person.svg"}
                  alt="person icon"
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <span style={{ width: "25%", fontSize: fontSizeBrief }}>
                {author}
              </span>
              <div
                className={styles.container__fukidashi}
                style={{
                  top:
                    mediaContext === "mobile"
                      ? "-290%"
                      : mediaContext === "tablet"
                      ? "-300%"
                      : "-300%",
                  left: "30%",
                  opacity: !mouseOver[1] ? 0 : 1,
                  width: "44%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  Number of servings of the recipe
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="1"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/servings.svg"}
                  alt="servings icon"
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              {originalServingsValue !== 0 && (
                <input
                  className={styles.input__brief_explanation}
                  style={{ width: "17%", fontSize: fontSizeBrief }}
                  type="number"
                  min="1"
                  max={MAX_SERVINGS}
                  name="servings"
                  placeholder="Servings"
                  value={curServingsValue}
                  onChange={onChangeServings}
                />
              )}
              <span style={{ width: "25%", fontSize: fontSizeBrief }}>
                {servingsUnit !== "other" ? servingsUnit : servingsCustomUnit}
              </span>
            </div>
            <div
              className={styles.container__units}
              style={{ gap: mediaContext === "mobile" ? "4%" : "2%" }}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top:
                    mediaContext === "mobile"
                      ? "-280%"
                      : mediaContext === "tablet"
                      ? "-295%"
                      : "-295%",
                  left: "-13%",
                  opacity: !mouseOver[2] ? 0 : 1,
                  width: "44%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  Unit system you prefer
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="2"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/scale.svg"}
                  alt="ingredient units icon"
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <select
                className={styles.input__brief_explanation}
                style={{ width: "30%", fontSize: fontSizeBrief }}
                name="region"
                value={regionUnit}
                onChange={onChangeRegionUnit}
              >
                <option value="original">Original</option>
                <option value="metric">Metric</option>
                <option value="us">US</option>
                <option value="japan">Japan</option>
                <option value="australia">Australia</option>
                <option value="metricCup">Metric cup (1cup = 250ml)</option>
              </select>

              <div
                className={styles.container__fukidashi}
                style={{
                  top:
                    mediaContext === "mobile"
                      ? "-275%"
                      : mediaContext === "tablet"
                      ? "-295%"
                      : "-295%",
                  left: "30%",
                  opacity: !mouseOver[3] ? 0 : 1,
                  width: "44%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  Temperatures used in the recipe
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="3"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/temperature.svg"}
                  alt="ingredient units icon"
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <span style={{ fontSize: fontSizeBrief }}>{temperaturs}</span>
              <select
                className={styles.input__brief_explanation}
                style={{ width: "fit-content", fontSize: fontSizeBrief }}
                name="temperatureUnit"
                value={temperatureUnit}
                onChange={handleChangeInput}
              >
                <option value="℃">℃</option>
                <option value="℉">℉</option>
              </select>
            </div>
          </>
        )}
        {/* <div className={styles.container__author_servings}>
          <div
            className={styles.icons__brief_explanation}
            data-icon="0"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: edit ? "530%" : "380%",
                height: edit ? "340%" : "220%",
                top: edit ? "-350%" : "-230%",
                left: edit ? "-460%" : "-280%",
                paddingLeft: "10%",
                opacity: !mouseOver[0] ? 0 : 1,
              }}
            >
              <p className={styles.p__fukidashi}>
                {edit
                  ? "Name of the person who will make the recipe"
                  : "Author of the recipe"}
              </p>
            </div>
            <Image
              src={"/person.svg"}
              alt="person icon"
              width={13}
              height={13}
            ></Image>
          </div>
          {edit ? (
            <input
              className={styles.input__brief_explanation}
              style={{ width: "19%" }}
              name="author"
              placeholder="Author"
              value={author}
              onChange={(e) => handleChangeInput(e, 0)}
            ></input>
          ) : (
            <span style={{ width: "19%" }}>{author}</span>
          )}

          <div
            className={styles.icons__brief_explanation}
            data-icon="1"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: edit ? "700%" : "500%",
                height: edit ? "420%" : "280%",
                top: edit ? "-450%" : "-280%",
                left: edit ? "-545%" : "-380%",
                padding: "0 0 10% 10%",
                opacity: !mouseOver[1] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ padding: "0 3% 48% 3%" }}
              >
                {edit
                  ? "Number of servings. If there isn't a unit you want to use in the selector, please select other and fill custom unit."
                  : "Number of servings of the recipe"}
              </p>
            </div>
            <Image
              src={"/servings.svg"}
              alt="servings icon"
              width={14}
              height={15}
            ></Image>
          </div>
          <input
            className={styles.input__brief_explanation}
            style={{ width: "17%" }}
            type="number"
            min="1"
            max={MAX_SERVINGS}
            name="servings"
            placeholder="Servings"
            value={servingsValue}
            onChange={onChangeServings}
          />
          {edit ? (
            <>
              <select
                className={styles.input__brief_explanation}
                style={{ width: "22%" }}
                name="servingsUnit"
                value={servingsUnit}
                onChange={(e) => handleChangeInput(e, 0)}
              >
                <option value="people">people</option>
                <option value="slices">slices</option>
                <option value="pieces">pieces</option>
                <option value="cups">cups</option>
                <option value="bowls">bowls</option>
                <option value="other">other</option>
              </select>
              {servingsUnit === "other" && (
                <input
                  className={styles.input__brief_explanation}
                  style={{ width: "20%" }}
                  name="servingsCustomUnit"
                  placeholder="Custom unit"
                  value={servingsCustomUnit}
                  onChange={(e) => handleChangeInput(e, 0)}
                />
              )}
            </>
          ) : (
            <span style={{ width: "20%" }}>
              {servingsUnit !== "other" ? servingsUnit : servingsCustomUnit}
            </span>
          )}
        </div> 
        <div className={styles.container__units}>
          {!edit && (
            <>
              <div
                className={styles.icons__brief_explanation}
                data-icon="2"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <div
                  className={styles.container__fukidashi}
                  style={{
                    width: "400%",
                    height: "250%",
                    top: "-260%",
                    left: "-300%",
                    paddingLeft: "10%",
                    opacity: !mouseOver[2] ? 0 : 1,
                  }}
                >
                  <p className={styles.p__fukidashi}>Unit system you prefer</p>
                </div>
                <Image
                  src={"/scale.svg"}
                  alt="ingredient units icon"
                  width={14}
                  height={16}
                ></Image>
              </div>
              <select
                className={styles.input__brief_explanation}
                style={{ width: "25%" }}
                name="region"
                value={regionUnit}
                onChange={onChangeRegionUnit}
              >
                <option value="original">Original</option>
                <option value="metric">Metric</option>
                <option value="us">US</option>
                <option value="japan">Japan</option>
                <option value="australia">Australia</option>
                <option value="metricCup">Metric cup (1cup = 250ml)</option>
              </select>
            </>
          )}

          <div
            className={styles.icons__brief_explanation}
            data-icon="3"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: edit ? "520%" : "490%",
                height: edit ? "360%" : "300%",
                top: edit ? "-380%" : "-300%",
                left: edit ? "-390%" : "-370%",
                paddingTop: "20%",
                opacity: !mouseOver[3] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ padding: "0 5% 57% 5%" }}
              >
                {edit
                  ? "Temperatures you use in the recipe (e.g. oven temperatures)"
                  : "Temperatures used in the recipe"}
              </p>
            </div>
            <Image
              src={"/temperature.svg"}
              alt="ingredient units icon"
              width={17}
              height={17}
            ></Image>
          </div>
          {edit ? (
            tempKeys.map((keyObj, i) => (
              <InputTemp
                key={keyObj.id}
                edit={edit}
                temperature={curRecipe.temperatures.temperatures[i]}
                temperatureUnit={temperatureUnit}
                i={i}
              />
            ))
          ) : (
            <span>{temperaturs}</span>
          )}
          <select
            className={styles.input__brief_explanation}
            style={{ width: "8%" }}
            name="temperatureUnit"
            value={temperatureUnit}
            onChange={(e) => handleChangeInput(e, 0)}
          >
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
        </div>*/}
      </div>
      <button
        style={{
          background: "none",
          backgroundImage: !favorite
            ? 'url("/star-off.png")'
            : 'url("/star-on.png")',
          width:
            mediaContext === "mobile"
              ? "7%"
              : mediaContext === "tablet"
              ? "5.5%"
              : "4.5%",
          aspectRatio: "1",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100%",
          border: "none",
        }}
        type="button"
        onClick={onClickFavorite}
      ></button>
    </div>
  );
}

function InputTemp({
  mediaContext,
  fontSize,
  fontSizeBrief,
  edit,
  temperature,
  temperatureUnit,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  fontSizeBrief: string;
  edit: boolean;
  temperature: number;
  temperatureUnit: "℉" | "℃";
  i: number;
}) {
  const [temp, setTemp] = useState<number>(temperature);

  function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setTemp(value);
  }

  ///when temperature unit changes and user is not editing, convert temp
  useEffect(() => {
    if (edit || !temp) return;

    setTemp(convertTempUnits(temp, temperatureUnit === "℃" ? "℉" : "℃"));
  }, [temperatureUnit]);

  return (
    <input
      className={styles.input__brief_explanation}
      style={{
        width: mediaContext === "mobile" ? "16%" : "18%",
        fontSize: edit ? fontSize : fontSizeBrief,
      }}
      type="number"
      name={`temperature${i + 1}`}
      placeholder={`${mediaContext === "mobile" ? "" : "Temp"} ${i + 1}`}
      value={temp}
      onChange={handleChangeTemp}
    ></input>
  );
}

function Ingredients({
  mediaContext,
  fontSize,
  headerSize,
  edit,
  servingsValue,
  ingredients,
  regionUnit,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  edit: boolean;
  servingsValue: number;
  ingredients: TYPE_INGREDIENTS;
  regionUnit: TYPE_REGION_UNIT;
}) {
  const [numberOfLines, setNumberOfLines] = useState(ingredients.length);
  const [lines, setLines] = useState<any[]>(
    ingredients.map(() => {
      return { id: nanoid() };
    })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();

  function handleClickPlus() {
    setNumberOfLines((prev) => prev + 1);
  }

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    setNumberOfLines((prev) => prev - 1);
  }

  ////Manually update lines to remain current state when users delete line
  useEffect(() => {
    ///when line is added
    if (lines.length < numberOfLines)
      setLines((prev) => [...prev, { id: nanoid() }]);

    ///when line is deleted
    if (lines.length > numberOfLines)
      setLines((prev) => {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        return prev.toSpliced(deletedIndex, 1);
      });
  }, [numberOfLines]);

  return (
    <div
      style={{
        position: "relative",
        width: mediaContext === "mobile" ? "93%" : "90%",
        height: "fit-content",
        backgroundColor: "rgb(255, 247, 177)",
        padding: "2%",
        borderRadius: "3px",
        overflowX: !edit ? "auto" : "visible",
      }}
    >
      <h2
        className={styles.header}
        style={{
          fontSize: headerSize,
          marginBottom: headerSize,
        }}
      >
        Ingredients
      </h2>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            edit || mediaContext === "mobile" ? "auto" : "auto auto",
          justifyItems: "left",
          marginTop: "2%",
          fontSize,
          wordSpacing: "0.1vw",
          columnGap: mediaContext === "tablet" ? "0" : "5%",
          rowGap: edit
            ? mediaContext === "mobile"
              ? `calc(${fontSize} * 2)`
              : fontSize
            : "1%",
        }}
      >
        {lines.map((line, i) => (
          <IngLine
            key={line.id}
            mediaContext={mediaContext}
            fontSize={fontSize}
            edit={edit}
            servingsValue={servingsValue}
            ingredient={
              ingredients[i] || {
                ingredient: "",
                amount: 0,
                unit: "g",
                customUnit: "",
                id: undefined,
                convertion: undefined,
              }
            }
            regionUnit={regionUnit}
            i={i}
            onClickDelete={handleClickDelete}
          />
        ))}
        {edit && (
          <div className={styles.ingredients_line}>
            <ButtonPlus
              mediaContext={mediaContext}
              fontSize={fontSize}
              onClickBtn={handleClickPlus}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function IngLine({
  mediaContext,
  fontSize,
  edit,
  servingsValue,
  ingredient,
  regionUnit,
  i,
  onClickDelete,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  edit: boolean;
  servingsValue: number;
  ingredient: TYPE_INGREDIENT;
  regionUnit: TYPE_REGION_UNIT;
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const typeIngArr: TYPE_INGREDIENT_UNIT[] = [
    "noUnit",
    "other",
    "g",
    "kg",
    "oz",
    "lb",
    "ml",
    "L",
    "USCup",
    "JapaneseCup",
    "ImperialCup",
    "riceCup",
    "tsp",
    "Tbsp",
    "AustralianTbsp",
  ];

  function isTypeIngUnit(unit: any) {
    return typeIngArr.includes(unit);
  }

  //ingredient unit is set as unit if ingredient unit is TYPE_INGREDIENT_UNIT, otherwise customUnit
  const [line, setLine] = useState({
    ingredient: ingredient.ingredient,
    amount: ingredient.amount,
    unit: isTypeIngUnit(ingredient.unit) ? ingredient.unit : "other",
    customUnit: isTypeIngUnit(ingredient.unit) ? "" : ingredient.unit,
  });

  const [newIngredient, setNewIngredient] = useState<{
    amount: number;
    unit: string;
  }>({
    amount: ingredient.amount,
    unit: getReadableIngUnit(ingredient.unit),
  });

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;

    setLine((prev) => {
      const newLine = { ...prev };
      if (target.name.includes("Name")) newLine.ingredient = target.value;
      if (target.name.includes("Amount")) newLine.amount = +target.value;
      if (target.name.includes("Unit") && !target.name.includes("CustomUnit"))
        newLine.unit = target.value;
      if (target.name.includes("CustomUnit")) newLine.customUnit = target.value;
      return newLine;
    });
  }

  useEffect(() => {
    //Not applicable converted ingredients unit => ingrediet otherwise converted ingredient
    const newIngredient =
      edit || !ingredient.convertion[regionUnit]
        ? {
            amount: ingredient.amount,
            unit: getReadableIngUnit(ingredient.unit),
          }
        : ingredient.convertion[regionUnit];

    setNewIngredient(newIngredient);
  }, [ingredient, servingsValue, regionUnit]);

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: edit ? "2%" : "4%",
        whiteSpace: "nowrap",
      }}
    >
      {edit ? (
        <>
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{
              width: `calc(${fontSize} * 1.2)`,
              height: "80%",
              right:
                mediaContext === "mobile"
                  ? "2%"
                  : mediaContext === "tablet"
                  ? "-7.5%"
                  : "-7%",
              top: mediaContext === "mobile" ? "120%" : "10%",
            }}
            type="button"
            onClick={() => onClickDelete(i)}
          ></button>
          <span style={{ fontSize }}>{i + 1}. </span>
          <input
            className={styles.input__brief_explanation}
            style={{
              width: line.unit !== "other" ? "35%" : "27%",
              fontSize,
              padding: "1%",
            }}
            name={`ingredient${i + 1}Name`}
            placeholder={`Name ${i + 1}`}
            value={line.ingredient}
            onChange={handleChangeInput}
          ></input>
          <input
            className={styles.input__brief_explanation}
            style={{
              width: line.unit !== "other" ? "26%" : "20%",
              fontSize,
              padding: "1%",
            }}
            type="number"
            name={`ingredient${i + 1}Amount`}
            placeholder="Amount"
            value={line.amount || ""}
            onChange={handleChangeInput}
          ></input>
          <select
            className={styles.input__brief_explanation}
            style={{
              width: line.unit !== "other" ? "25%" : "18%",
              fontSize,
              padding: "1%",
            }}
            name={`ingredient${i + 1}Unit`}
            value={line.unit}
            onChange={handleChangeInput}
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="cupUS">cup (US)</option>
            <option value="cupJapan">cup (Japan)</option>
            <option value="cupImperial">cup (1cup = 250ml)</option>
            <option value="riceCup">rice cup</option>
            <option value="tsp">tsp</option>
            <option value="Tbsp">Tbsp</option>
            <option value="TbspAustralia">Tbsp (Australia)</option>
            <option value="pinch">pinch</option>
            <option value="can">can</option>
            <option value="slice">slice</option>
            <option value="other">Other</option>
            <option value="noUnit">No unit</option>
          </select>
          {line.unit === "other" && (
            <input
              className={styles.input__brief_explanation}
              style={{ width: "25%", padding: "1%", fontSize }}
              type="text"
              name={`ingredient${i + 1}CustomUnit`}
              placeholder="Custom unit"
              value={line.customUnit}
              onChange={handleChangeInput}
            />
          )}
        </>
      ) : (
        <>
          <input
            style={{ width: fontSize, marginLeft: "2%" }}
            type="checkbox"
          ></input>
          {newIngredient.amount !== 0 && (
            <span style={{ fontSize }}>
              {newIngredient.unit === "g" ||
              newIngredient.unit === "kg" ||
              newIngredient.unit === "oz" ||
              newIngredient.unit === "lb" ||
              newIngredient.unit === "ml" ||
              newIngredient.unit === "L"
                ? newIngredient.amount
                : fracty(newIngredient.amount)}
            </span>
          )}
          {newIngredient.unit && (
            <span style={{ fontSize }}>{`${newIngredient.unit} of`}</span>
          )}
          <span style={{ fontSize }}>{ingredient.ingredient}</span>
        </>
      )}
    </div>
  );
}

function ButtonPlus({
  mediaContext,
  fontSize,
  onClickBtn,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  onClickBtn: () => void;
}) {
  return (
    <button
      style={{
        fontWeight: "bold",
        fontSize,
        width: mediaContext === "mobile" ? "8%" : "6%",
        aspectRatio: "1",
        color: "white",
        backgroundColor: "brown",
        borderRadius: "50%",
        border: "none",
      }}
      type="button"
      onClick={onClickBtn}
    >
      +
    </button>
  );
}

function Instructions({
  mediaContext,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  edit,
  instructions,
  addInstruction,
  deleteInstruction,
  onChangeInstruction,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  edit: boolean;
  instructions: { instruction: string; image: TYPE_FILE | undefined }[] | [];
  addInstruction: () => void;
  deleteInstruction: (index: number) => void;
  onChangeInstruction: (value: string, i: number) => void;
  onChangeImage: (image: TYPE_FILE, index: number) => void;
  deleteImage: (index: number) => void;
  displayError: (error: string) => void;
}) {
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [recipeInstructions, setRecipeInstructions] = useState(
    instructions.map(() => {
      return { id: nanoid() };
    })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    deleteInstruction(i);
  }

  //manually add or splice key info to remain other instructions info
  useEffect(() => {
    setRecipeInstructions((prev) => {
      //when user adds instruction
      if (prev.length < instructions.length) return [...prev, { id: nanoid() }];

      //when user deletes instruction
      if (prev.length > instructions.length) {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        const newInstructions = [...prev];
        return newInstructions.toSpliced(deletedIndex, 1);
      }

      return prev;
    });
  }, [instructions.length, deletedIndex]);

  return (
    <div
      style={{
        position: "relative",
        marginTop,
        width: mediaContext === "mobile" ? "90%" : "80%",
        height: "fit-content",
      }}
    >
      <h2
        className={styles.header}
        style={{ fontSize: headerSize, marginBottom: headerSize }}
      >
        Instructions
      </h2>
      {recipeInstructions.length !== 0 &&
        recipeInstructions.map((keyObj, i) => (
          <Instruction
            key={keyObj.id}
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            i={i}
            edit={edit}
            instruction={
              instructions[i] || { instruction: "", image: undefined }
            }
            onClickDelete={handleClickDelete}
            onChangeInstruction={onChangeInstruction}
            onClickDeleteImage={deleteImage}
            onChangeImage={onChangeImage}
            displayError={displayError}
          />
        ))}
      {!edit && recipeInstructions.length === 0 && (
        <p className={styles.no_content} style={{ fontSize }}>
          There're no instructions
        </p>
      )}
      {edit && (
        <div
          style={{
            width: "100%",
            height: "fit-content",
            backgroundColor: "rgba(255, 255, 236, 0.91)",
            paddingBottom: "2%",
          }}
        >
          <ButtonPlus
            mediaContext={mediaContext}
            fontSize={fontSize}
            onClickBtn={addInstruction}
          />
        </div>
      )}
    </div>
  );
}

function Instruction({
  mediaContext,
  recipeWidth,
  fontSize,
  edit,
  i,
  instruction,
  onClickDelete,
  onChangeInstruction,
  onClickDeleteImage,
  onChangeImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  edit: boolean;
  i: number;
  instruction: { instruction: string; image: TYPE_FILE | undefined };
  onClickDelete: (i: number) => void;
  onChangeInstruction: (value: string, i: number) => void;
  onClickDeleteImage: (i: number) => void;
  onChangeImage: (image: TYPE_FILE, i: number) => void;
  displayError: (error: string) => void;
}) {
  //design
  const imageWidth =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.28, "100px")
      : getSize(recipeWidth, 0.22, "140px");

  const imageHeight =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.2, "70px")
      : getSize(recipeWidth, 0.15, "100px");

  async function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      Resizer.imageFileResizer(
        files[0],
        140,
        100,
        "WEBP",
        100,
        0,
        (uri) => {
          const fileData = getImageFileData(files[0], uri);
          onChangeImage(fileData, i);
        },
        "base64"
      );
    } catch (err: any) {
      console.error("Error while resizing instruction image", err.message);
      displayError("Server error while uploading image 🙇‍♂️ Please try again!");
    }
  }

  function handleChangeInstruction(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    onChangeInstruction(value, i);
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        textAlign: "left",
        alignItems: "center",
        gap: mediaContext === "mobile" ? "2%" : "5%",
        width: "100%",
        height: "fit-content",
        backgroundColor: "rgba(255, 255, 236, 0.91)",
        padding: "4% 3%",
        fontSize,
        letterSpacing: "0.05vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          width: mediaContext === "mobile" ? "8%" : "5%",
          aspectRatio: "1",
          fontSize,
          borderRadius: "50%",
          color: "white",
          backgroundColor: " #ce3a00e7 ",
        }}
      >
        {i + 1}
      </span>
      {edit ? (
        <textarea
          style={{
            width: "55%",
            height: "100px",
            fontSize,
            letterSpacing: "0.03vw",
            padding: "0.3% 1%",
            resize: "none",
          }}
          name={`instruction${i + 1}`}
          placeholder={`Instruction ${i + 1}`}
          // value={instructionText}
          value={instruction.instruction}
          onChange={handleChangeInstruction}
        ></textarea>
      ) : (
        <p
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: instruction.image ? "55%" : "100%",
            height: "100px",
            fontSize,
            letterSpacing: "0.03vw",
            padding: instruction.image ? "0 1%" : "0 0 0 3%",
          }}
        >
          {instruction.instruction}
        </p>
      )}
      <div
        style={{
          position: "relative",
          width: instruction.image || edit ? imageWidth : "0",
          height: imageHeight,
        }}
      >
        {edit && !instruction.image?.data && (
          <div
            className={styles.grey_background}
            style={{ width: "100%", height: "100%" }}
          >
            <button
              className={clsx(styles.btn__img, styles.btn__upload_img)}
              style={{
                width: "20%",
                height: "30%",
                top: "30%",
                left: "40%",
              }}
              type="button"
            ></button>
            <input
              className={clsx(styles.input__file)}
              style={{
                width: "20%",
                height: "30%",
                top: "30%",
                left: "40%",
              }}
              type="file"
              accept="image/*"
              name={`instruction${i + 1}Image`}
              onChange={handleChangeImg}
            />
          </div>
        )}
        {instruction.image?.data && (
          <Image
            src={instruction.image.data}
            alt={`instruction ${i + 1} image`}
            width={parseFloat(imageWidth)}
            height={parseFloat(imageHeight)}
          ></Image>
        )}
        {edit && instruction.image?.data && (
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{
              right: "0",
              top: mediaContext === "mobile" ? "110%" : "103%",
              width: `calc(${fontSize} * 1.2)`,
              height: `calc(${fontSize} * 1.2)`,
            }}
            type="button"
            onClick={() => onClickDeleteImage(i)}
          ></button>
        )}
      </div>
      {edit && (
        <button
          className={clsx(styles.btn__img, styles.btn__trash_img)}
          style={{
            right: mediaContext === "mobile" ? "-8%" : "-20%",
            top: "44%",
            width: mediaContext === "mobile" ? "10%" : "18%",
            height: mediaContext === "mobile" ? "15%" : "18%",
          }}
          type="button"
          onClick={() => onClickDelete(i)}
        ></button>
      )}
    </div>
  );
}

function AboutThisRecipe({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
  edit,
  curRecipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [description, setDescription] = useState(curRecipe.description);

  function handleChangeDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;

    setDescription(value);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        width: "100%",
        maxHeight: "30%",
        marginTop,
      }}
    >
      <h2
        className={styles.header}
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        About this recipe
      </h2>
      <div
        style={{
          backgroundColor:
            description || edit ? "rgb(255, 247, 133)" : "transparent",
          width: mediaContext === "mobile" ? "90%" : "85%",
          aspectRatio: edit
            ? mediaContext === "mobile"
              ? "1/0.4"
              : "1/0.3"
            : "1/0.28",
          fontSize,
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: edit ? "hidden" : "auto",
          scrollbarColor: "rgb(255, 247, 133) rgba(255, 209, 2, 1)",
        }}
      >
        {edit ? (
          <textarea
            style={{
              resize: "none",
              width: "100%",
              height: "100%",
              fontSize,
              letterSpacing: "0.05vw",
              padding: "1.2% 1.5%",
              background: "none",
              border: "none",
            }}
            name="description"
            placeholder="Click here to set an explanation for the recipe"
            value={description}
            onChange={handleChangeDescription}
          ></textarea>
        ) : (
          <p
            className={description || styles.no_content}
            style={{
              width: "100%",
              height: "100%",
              fontSize,
              letterSpacing: "0.05vw",
              padding: "1.2% 1.5%",
            }}
          >
            {description || "There's no description"}
          </p>
        )}
      </div>
    </div>
  );
}

function Memories({
  mediaContext,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  edit,
  images,
  onChangeImages,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  edit: boolean;
  images: [] | TYPE_FILE[];
  onChangeImages: (imagesArr: TYPE_FILE[]) => void;
  deleteImage: (i: number) => void;
  displayError: (error: string) => void;
}) {
  const MAX_SLIDE = images.length - 1;

  //design
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.9, "300px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.65, "400px")
      : getSize(recipeWidth, 0.55, "400px");
  const height = parseInt(width) * 0.55 + "px";

  const [timeourId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [curImage, setCurImage] = useState(0);

  useEffect(() => {
    if (edit || !images.length) return;
    if (timeourId) clearInterval(timeourId);

    const id = setTimeout(() => {
      const nextSlide = getNextSlideIndex(curImage, MAX_SLIDE);
      setCurImage(nextSlide);
    }, SLIDE_TRANSITION_SEC * 1000);

    setTimeoutId(id);
  }, [curImage, edit]);

  function handleClickDot(i: number) {
    setCurImage(i);
  }

  async function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      const promiseArr = Array.from(files).map(
        (file) =>
          new Promise((resolve) =>
            Resizer.imageFileResizer(
              file,
              400,
              220,
              "WEBP",
              100,
              0,
              (uri) => resolve(getImageFileData(file, uri)),
              "base64"
            )
          )
      );
      const imageFiles = (await Promise.all(promiseArr)) as TYPE_FILE[];

      onChangeImages(imageFiles);
    } catch (err: any) {
      console.error("Error while resizing memory images", err.message);
      displayError("Server error while uploading images 🙇‍♂️ Please try again!");
    }
  }

  function handleDeleteImg(i: number) {
    deleteImage(i);

    //if deleted img was the last img and not the only img, set curImg as one before the img, otherwise, one after the img
    setCurImage((prev) =>
      prev && images.length - 1 === prev ? prev - 1 : prev
    );
  }

  return (
    <div
      style={{
        marginTop,
        width:
          mediaContext === "mobile"
            ? "90%"
            : mediaContext === "tablet"
            ? "65%"
            : "55%",
        height:
          edit || images.length
            ? `calc(${headerSize} * 2 + ${height})`
            : `calc(${height} * 0.8)`,
        // backgroundColor: "cadetblue",
        // height: edit || images.length ? "250px" : "150px",
      }}
    >
      <h2
        className={styles.header}
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        Memories of the recipe
      </h2>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height:
            edit || images.length
              ? height
              : `calc(${height} * 0.8 - ${headerSize} * 2)`,

          overflow: "hidden",
          // backgroundColor: "blue",
        }}
      >
        {images.map((img, i) => (
          <MemoryImg
            key={i}
            width={width}
            height={height}
            edit={edit}
            i={i}
            image={img}
            translateX={calcTransitionXSlider(i, curImage)}
            onClickDelete={handleDeleteImg}
          />
        ))}
        {edit && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: calcTransitionXSlider(images.length, curImage),
              transition: "all 0.4s",
            }}
          >
            <div
              className={styles.grey_background}
              style={{ width: "100%", height: "100%" }}
            >
              <button
                className={clsx(styles.btn__img, styles.btn__upload_img)}
                style={{
                  width: "62%",
                  height: "18%",
                  top: "38%",
                  left: "25%",
                  fontSize,
                  letterSpacing: "0.07vw",
                  color: "rgba(255, 168, 7, 1)",
                  fontWeight: "bold",
                }}
                type="button"
              >
                Upload images
              </button>
              <input
                className={styles.input__file}
                style={{
                  width: "62%",
                  height: "18%",
                  top: "38%",
                  left: "25%",
                }}
                type="file"
                accept="image/*"
                name="memoryImages"
                multiple
                onChange={handleChangeImg}
              />
            </div>
          </div>
        )}
        {edit || images.length ? (
          <div
            style={{
              position: "absolute",
              width:
                mediaContext === "mobile"
                  ? "85%"
                  : mediaContext === "tablet"
                  ? "80%"
                  : "70%",
              height: "5%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap:
                mediaContext === "mobile"
                  ? "2.4%"
                  : mediaContext === "tablet"
                  ? "2.2%"
                  : "1.8%",
              bottom: "5%",
            }}
          >
            {/* add one for upload slide for edit */}
            {edit
              ? [...images, ""].map((_, i) => (
                  <button
                    key={i}
                    style={{
                      opacity: "0.6",
                      width: mediaContext === "mobile" ? "3.5%" : "3%",
                      aspectRatio: "1",
                      backgroundColor:
                        curImage === i ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                      borderRadius: "50%",
                      border: "none",
                    }}
                    type="button"
                    onClick={() => handleClickDot(i)}
                  ></button>
                ))
              : images.map((_, i) => (
                  <button
                    key={i}
                    style={{
                      opacity: "0.6",
                      width: mediaContext === "mobile" ? "3.5%" : "3%",
                      aspectRatio: "1",
                      backgroundColor:
                        curImage === i ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                      borderRadius: "50%",
                      border: "none",
                    }}
                    type="button"
                    onClick={() => handleClickDot(i)}
                  ></button>
                ))}
          </div>
        ) : (
          <p className={styles.no_content} style={{ fontSize }}>
            There're no memory images
          </p>
        )}

        {/* {!edit && !images.length && (
          <p className={styles.no_content} style={{ fontSize }}>
            There're no memory images
          </p>
        )} */}
      </div>
    </div>
  );
}

function MemoryImg({
  width,
  height,
  edit,
  i,
  image,
  translateX,
  onClickDelete,
}: {
  width: string;
  height: string;
  edit: boolean;
  i: number;
  image: TYPE_FILE;
  translateX: string;
  onClickDelete: (i: number) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        transform: translateX,
        transition: "all 0.4s",
      }}
    >
      {edit && (
        <button
          className={clsx(styles.btn__img, styles.btn__trash_img)}
          style={{
            right: "0",
            top: "80%",
            width: "12%",
            height: "12%",
          }}
          type="button"
          onClick={() => onClickDelete(i)}
        ></button>
      )}
      {image && (
        <Image
          src={image.data}
          alt={`memory image ${i + 1}`}
          width={parseFloat(width)}
          height={parseFloat(height)}
        ></Image>
      )}
    </div>
  );
}

function Comments({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
  edit,
  curRecipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [comments, setComments] = useState(curRecipe.comments);

  function handleChangeComments(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setComments(value);
  }

  return (
    <div
      style={{
        marginTop,
        width:
          mediaContext === "mobile"
            ? "90%"
            : mediaContext === "tablet"
            ? "80%"
            : "70%",
        aspectRatio: "1/0.5",
        // height: comments ? "200px" : "150px",
      }}
    >
      <h2
        className={styles.header}
        style={{ fontSize: headerSize, marginBottom: headerSize }}
      >
        {" "}
        Comments
      </h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor:
            edit || comments ? "rgb(255, 253, 222)" : "transparent",
        }}
      >
        {edit ? (
          <textarea
            style={{
              resize: "none",
              background: "none",
              border: "none",
              width: "100%",
              height: "100%",
              fontSize,
              letterSpacing: "0.05vw",
              padding: "3%",
            }}
            name="comments"
            placeholder="Click here to set comments"
            value={comments}
            onChange={handleChangeComments}
          ></textarea>
        ) : (
          <p
            className={comments || styles.no_content}
            style={{
              width: "100%",
              height: "100%",
              fontSize,
              letterSpacing: comments ? "0.05vw" : "0.03vw",
              padding: comments ? "3%" : "0",
              overflowY: "auto",
              textAlign: comments ? "left" : "center",
            }}
          >
            {comments || "There're no comments"}
          </p>
        )}
      </div>
    </div>
  );
}
