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
  SLIDE_TRANSITION_SEC,
} from "@/app/lib/config/settings";
//general methods
import { wait, getData, getSize } from "@/app/lib/helpers/other";
//methods for recipes
import {
  uploadRecipe,
  getTemperatures,
  // getRegion,
  getReadableIngUnit,
  calcTransitionXSlider,
  updateIngsForServings,
  updateConvertion,
  getNextSlideIndex,
  getImageFileData,
  isRecipeAllowed,
  getIngGridTemplateColumnsStyle,
} from "@/app/lib/helpers/recipes";
//methods to convert
import { convertIngUnits, convertTempUnits } from "@/app/lib/helpers/converter";
//context
import { MediaContext, UserContext } from "@/app/lib/providers";
//components
import {
  BtnFavorite,
  ErrorMessageRecipe,
  Loading,
  RecipeNoEdit,
} from "@/app/lib/components/components";
//library
import { nanoid } from "nanoid";
import fracty from "fracty";

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
    setRecipe(recipeData);
    setCurRecipe(recipeData);
    setFavorite(recipeData.favorite);
    setServingsValue(recipeData.servings.servings);
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

  function handleClickFavorite() {
    setFavorite(!favorite);
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
        _id: curRecipe?._id,
        favorite: favorite === true ? true : false,
        mainImage: curRecipe?.mainImage,
        mainImagePreview: curRecipe?.mainImagePreview,
        title: String(formData.get("title"))?.trim() || "",
        author: String(formData.get("author")).trim() || "",
        // region: getRegion(ingredients),
        servings: {
          servings: +(formData.get("servings") || 0),
          unit: String(formData.get("servingsUnit")),
          customUnit: String(formData.get("servingsCustomUnit") || "").trim(),
        },
        temperatures: {
          temperatures: tempArr,
          unit:
            formData.get("temperatureUnit") === "℉" ? "℉" : ("℃" as "℉" | "℃"),
        },
        ingredients,
        preparation: String(formData.get("preparation")).trim(),
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
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSize}
          error={error}
          message={message}
          mainOrRecipe="recipe"
        />
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
                  color: "black",
                  boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
                  borderRadius: mediaContext === "mobile" ? "5px" : "10px",
                }}
                onSubmit={handleSubmit}
              >
                <ImageTitle
                  mediaContext={mediaContext}
                  recipeWidth={recipeWidth}
                  fontSize={fontSize}
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
                  curRecipe={curRecipe}
                  curServingsValue={servingsValue}
                  favorite={favorite}
                  onChangeServings={handleChangeServings}
                  onClickFavorite={handleClickFavorite}
                />
                <Ingredients
                  mediaContext={mediaContext}
                  fontSize={fontSize}
                  headerSize={headerSize}
                  ingredients={curRecipe.ingredients}
                  regionUnit={regionUnit}
                />
                <Instructions
                  mediaContext={mediaContext}
                  recipeWidth={recipeWidth}
                  fontSize={fontSize}
                  headerSize={headerSize}
                  marginTop={marginTop}
                  preparation={curRecipe.preparation}
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
                  curRecipe={curRecipe}
                />
                <Memories
                  mediaContext={mediaContext}
                  recipeWidth={recipeWidth}
                  fontSize={fontSize}
                  headerSize={headerSize}
                  marginTop={marginTop}
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
                <button
                  className={styles.btn__upload_recipe}
                  style={{ fontSize: headerSize, marginTop: headerSize }}
                  type="submit"
                >
                  Upload
                </button>
              </form>
            </>
          ) : (
            <>
              {/* <button
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
              </button> */}
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

function ImageTitle({
  mediaContext,
  recipeWidth,
  fontSize,
  image,
  title,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
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
        </div>
      ) : (
        <>
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
        <input
          style={{
            width: "100%",
            height: "100%",
            background: "none",
            border: "none",
            letterSpacing: "0.07vw",
            fontSize: `calc(${fontSize} * 1.5)`,
            textAlign: "center",
            color: "rgb(60, 0, 116)",
          }}
          name="title"
          placeholder="Click here to set title"
          value={recipeTitle}
          onChange={handleChangeTitle}
        ></input>
      </div>
    </div>
  );
}

function BriefExplanation({
  mediaContext,
  recipeWidth,
  fontSize,
  curRecipe,
  curServingsValue,
  favorite,
  onChangeServings,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  curRecipe: TYPE_RECIPE;
  curServingsValue: number;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [author, setAuthour] = useState(curRecipe.author);
  const [servingsUnit, setServingsUnit] = useState(curRecipe.servings.unit);

  const [tempKeys, setTempKeys] = useState(
    Array(NUMBER_OF_TEMPERATURES)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
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
    setTemperatureUnit(curRecipe.temperatures.unit);
  }, [curRecipe]);

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
        {mediaContext === "mobile" && (
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
                min="0"
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
        {mediaContext !== "mobile" && (
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
              temperature={curRecipe.temperatures.temperatures[i]}
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
      </div>
      <BtnFavorite
        mediaContext={mediaContext}
        favorite={favorite}
        onClickFavorite={onClickFavorite}
      />
    </div>
  );
}

function InputTemp({
  mediaContext,
  fontSize,
  fontSizeBrief,
  temperature,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  fontSizeBrief: string;
  temperature: number;
  i: number;
}) {
  const [temp, setTemp] = useState<number>(temperature);

  function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setTemp(value);
  }

  return (
    <input
      className={styles.input__brief_explanation}
      style={{
        width: mediaContext === "mobile" ? "16%" : "18%",
        fontSize: fontSizeBrief,
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
  ingredients,
  regionUnit,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
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

  useEffect(() => {
    setLines(
      ingredients.map(() => {
        return { id: nanoid() };
      })
    );
  }, [ingredients]);

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
        padding: "2% 2% 8% 2%",
        borderRadius: "3px",
        overflowX: "visible",
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
          height: "fit-content",
          display: "grid",
          gridTemplateColumns: getIngGridTemplateColumnsStyle(
            ingredients,
            regionUnit,
            mediaContext,
            true
          ),
          justifyItems: "left",
          marginTop: "2%",
          fontSize,
          wordSpacing: "0.1vw",
          columnGap: mediaContext === "tablet" ? "0" : "5%",
          rowGap:
            mediaContext === "mobile" ? `calc(${fontSize} * 2)` : fontSize,
        }}
      >
        {lines.map((line, i) => (
          <IngLine
            key={line.id}
            mediaContext={mediaContext}
            fontSize={fontSize}
            ingredient={
              ingredients[i] || {
                ingredient: "",
                amount: 0,
                unit: "g",
                convertion: {
                  original: { amount: 0, unit: "g" },
                  metric: undefined,
                  us: undefined,
                  japan: undefined,
                  australia: undefined,
                  metricCup: undefined,
                  g: undefined,
                  kg: undefined,
                  oz: undefined,
                  lb: undefined,
                  ml: undefined,
                  L: undefined,
                  usCup: undefined,
                  japaneseCup: undefined,
                  imperialCup: undefined,
                  riceCup: undefined,
                  tsp: undefined,
                  tbsp: undefined,
                  australianTbsp: undefined,
                },
              }
            }
            i={i}
            onClickDelete={handleClickDelete}
          />
        ))}
        <div className={styles.ingredients_line}>
          <ButtonPlus
            mediaContext={mediaContext}
            fontSize={fontSize}
            onClickBtn={handleClickPlus}
          />
        </div>
      </div>
    </div>
  );
}

function IngLine({
  mediaContext,
  fontSize,
  ingredient,
  i,
  onClickDelete,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  ingredient: TYPE_INGREDIENT;
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
    "usCup",
    "japaneseCup",
    "imperialCup",
    "riceCup",
    "tsp",
    "tbsp",
    "australianTbsp",
    "pinch",
    "can",
    "slice",
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

  // useEffect(() => {
  //   setLine({
  //     ingredient: ingredient.ingredient,
  //     amount: ingredient.amount,
  //     unit: isTypeIngUnit(ingredient.unit) ? ingredient.unit : "other",
  //     customUnit: isTypeIngUnit(ingredient.unit) ? "" : ingredient.unit,
  //   });
  // }, [ingredient]);

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "2%",
        whiteSpace: "nowrap",
      }}
    >
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
        value={line.amount}
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
        <option value="usCup">cup (US)</option>
        <option value="japaneseCup">cup (Japan)</option>
        <option value="imperialCup">cup (1cup = 250ml)</option>
        <option value="riceCup">rice cup</option>
        <option value="tsp">tsp</option>
        <option value="tbsp">Tbsp</option>
        <option value="australianTbsp">Tbsp (Australia)</option>
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
      {/* ) : (
        <>
          <input
            style={{ width: fontSize, marginLeft: "2%" }}
            type="checkbox"
          ></input>
          <p style={{ fontSize }}>
            {(newIngredient.amount !== 0 && newIngredient.unit === "g") ||
            newIngredient.unit === "kg" ||
            newIngredient.unit === "oz" ||
            newIngredient.unit === "lb" ||
            newIngredient.unit === "ml" ||
            newIngredient.unit === "L"
              ? newIngredient.amount
              : fracty(newIngredient.amount)}{" "}
            &nbsp;
            {newIngredient.unit && `${newIngredient.unit} of`} &nbsp;
            {ingredient.ingredient}
          </p>
        </>
      )} */}
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
  preparation,
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
  preparation: string;
  instructions: { instruction: string; image: TYPE_FILE | undefined }[] | [];
  addInstruction: () => void;
  deleteInstruction: (index: number) => void;
  onChangeInstruction: (value: string, i: number) => void;
  onChangeImage: (image: TYPE_FILE, index: number) => void;
  deleteImage: (index: number) => void;
  displayError: (error: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [recipeInstructions, setRecipeInstructions] = useState(
    instructions.map(() => {
      return { id: nanoid() };
    })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();
  const [isTextareaFocus, setIsTextareaFocus] = useState(false);
  const [textareaWithBullet, setTextareaWithBullet] = useState(preparation);

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    deleteInstruction(i);
  }

  function handleToggleTextarea() {
    setIsTextareaFocus(!isTextareaFocus);
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setTextareaWithBullet(value);
  }

  //attach key event to Enter key and add a bullet point when it's pressed
  useEffect(() => {
    function handleAddBulletPoint(e: KeyboardEvent) {
      if (e.key !== "Enter" || !textareaRef.current || !isTextareaFocus) return;

      //split texts into each line and get rid of empty line
      const splitedTextsEachLine = textareaRef.current.value
        .split("\n")
        .filter((line) => line);

      //add a new line to increase bullet
      splitedTextsEachLine.push("");

      const nextTexts = splitedTextsEachLine
        .map((line) => (!line.includes("•") ? `• ${line}` : line))
        .join("\n");

      setTextareaWithBullet(nextTexts);
    }

    window.addEventListener("keydown", handleAddBulletPoint);

    return () => window.removeEventListener("keydown", handleAddBulletPoint);
  }, [isTextareaFocus]);

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "fit-content",
          backgroundColor: "rgba(250, 246, 185, 0.91)",
          marginBottom: fontSize,
          padding: "2%",
        }}
      >
        <span
          style={{
            fontSize: `calc(${fontSize} * 1.1)`,
            color: "rgba(117, 109, 0, 0.91)",
            margin: "0 3% 1.5% 3%",
            letterSpacing: "0.07vw",
            alignSelf: "flex-start",
          }}
        >
          Preparation
        </span>
        <textarea
          ref={textareaRef}
          style={{
            width: "95%",
            aspectRatio: "1/0.25",
            resize: "none",
            border: "none",
            backgroundColor: "transparent",
            padding: "2%",
            fontSize,
            letterSpacing: "0.05vw",
          }}
          placeholder='Click here to add preparation steps (A bullet point will come up for each line when you press "Enter")'
          name="preparation"
          value={textareaWithBullet}
          onFocus={handleToggleTextarea}
          onBlur={handleToggleTextarea}
          onChange={handleChangeTextarea}
        ></textarea>
      </div>
      {recipeInstructions.length !== 0 &&
        recipeInstructions.map((keyObj, i) => (
          <Instruction
            key={keyObj.id}
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            i={i}
            // edit={edit}
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
    </div>
  );
}

function Instruction({
  mediaContext,
  recipeWidth,
  fontSize,
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
      <textarea
        style={{
          width: "55%",
          aspectRatio: "1/0.7",
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
      <div
        style={{
          position: "relative",
          width: imageWidth,
          height: imageHeight,
        }}
      >
        {!instruction.image?.data && (
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
          <>
            <Image
              src={instruction.image.data}
              alt={`instruction ${i + 1} image`}
              width={parseFloat(imageWidth)}
              height={parseFloat(imageHeight)}
            ></Image>
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
          </>
        )}
      </div>
      <button
        className={clsx(styles.btn__img, styles.btn__trash_img)}
        style={{
          right: mediaContext === "mobile" ? "-8%" : "-13%",
          top: "44%",
          width: "10%",
          height: "15%",
        }}
        type="button"
        onClick={() => onClickDelete(i)}
      ></button>
    </div>
  );
}

function AboutThisRecipe({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
  curRecipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
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
          backgroundColor: "rgb(255, 247, 133)",
          width: mediaContext === "mobile" ? "90%" : "85%",
          aspectRatio: mediaContext === "mobile" ? "1/0.4" : "1/0.3",
          fontSize,
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: "hidden",
          scrollbarColor: "rgb(255, 247, 133) rgba(255, 209, 2, 1)",
        }}
      >
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

  const [curImage, setCurImage] = useState(0);

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
        height: `calc(${headerSize} * 2 + ${height})`,
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
          height,
          overflow: "hidden",
        }}
      >
        {images.map((img, i) => (
          <MemoryImg
            key={i}
            width={width}
            height={height}
            // edit={edit}
            i={i}
            image={img}
            translateX={calcTransitionXSlider(i, curImage)}
            onClickDelete={handleDeleteImg}
          />
        ))}
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
          {[...images, ""].map((_, i) => (
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
      </div>
    </div>
  );
}

function MemoryImg({
  width,
  height,
  i,
  image,
  translateX,
  onClickDelete,
}: {
  width: string;
  height: string;
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
  curRecipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
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
      }}
    >
      <h2
        className={styles.header}
        style={{ fontSize: headerSize, marginBottom: headerSize }}
      >
        Comments
      </h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor: "rgb(255, 253, 222)",
        }}
      >
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
      </div>
    </div>
  );
}
