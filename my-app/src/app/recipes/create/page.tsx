"use client";
import styles from "./page.module.css";
import Image from "next/image";
import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
import Resizer from "react-image-file-resizer";
import { nanoid } from "nanoid";
import {
  calcTransitionXSlider,
  convertFileToString,
  convertIngUnits,
  getData,
  getImageURL,
  getFileData,
  getRegion,
  getImageFileData,
  isRecipeAllowed,
  getSize,
} from "@/app/lib/helper";
import {
  MAX_SERVINGS,
  NUMBER_OF_TEMPERATURES,
  TYPE_RECIPE,
  TYPE_FILE,
  TYPE_INGREDIENT_UNIT,
  TYPE_SERVINGS_UNIT,
  TYPE_INGREDIENTS,
  TYPE_MEDIA,
} from "@/app/lib/config";
import { MediaContext, UserContext } from "@/app/lib/providers";
import { redirect, RedirectType } from "next/navigation";
import { Loading } from "@/app/lib/components/components";

export default function CreateRecipe() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  const [favorite, setFavorite] = useState(false);
  const [mainImage, setMainImage] = useState<TYPE_FILE | undefined>();
  const [mainImagePreview, setMainImagePreview] = useState<
    TYPE_FILE | undefined
  >();
  const [instructionImages, setInstructionImages] = useState<
    (TYPE_FILE | undefined)[]
  >([undefined]);
  const [memoryImages, setMemoryImages] = useState<TYPE_FILE[]>([]);

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

  function displayError(error: string) {
    setError(error);
  }

  function handleChangeMainImage(
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) {
    setMainImage(mainImageFile);
    setMainImagePreview(mainImagePreviewFile);
  }

  function handleDeleteMainImage() {
    setMainImage(undefined);
    setMainImagePreview(undefined);
  }

  function handleAddInstrucionImage() {
    setInstructionImages((prev) => [...prev, undefined]);
  }

  function handleDeleteInstructionImage(index: number) {
    setInstructionImages((prev) => {
      const newImages = [...prev];
      newImages[index] = undefined;
      return newImages;
    });
  }

  function handleChangeInstructionImage(file: TYPE_FILE, index: number) {
    setInstructionImages((prev) => {
      const newImages = [...prev];
      newImages[index] = file;
      return newImages;
    });
  }

  function handleDeleteInstruciton(index: number) {
    setInstructionImages((prev) => prev.toSpliced(index, 1));
  }

  function handleChangeMemoryImages(filesArr: TYPE_FILE[]) {
    setMemoryImages((prev) => [...prev, ...filesArr]);
  }

  function handleDeleteMemoryImage(index: number) {
    setMemoryImages((prev) => prev.toSpliced(index, 1));
  }

  function handleClickFavorite() {
    setFavorite(!favorite);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let recipeData;
    try {
      setIsPending(true);
      setError("");

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

      //filter out ing line with no ingredine and amount
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
      const instructions = new Array(instructionImages.length)
        .fill("")
        .map((_, i) => {
          return {
            instruction: String(formData.get(`instruction${i + 1}`)) || "",
            image: instructionImages[i],
          };
        })
        .filter((inst) => inst.instruction || inst.image);

      const newRecipe = {
        favorite: favorite === true ? true : false,
        mainImage,
        mainImagePreview,
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
        memoryImages,
        comments: String(formData.get("comments"))?.trim() || "",
        createdAt: new Date().toISOString(),
      };

      if (!isRecipeAllowed(newRecipe)) {
        setIsPending(false);
        setError("Please fill more than one input field!");
        return;
      }

      recipeData = await uploadRecipe(newRecipe);

      userContext?.addNumberOfRecipes();

      setIsPending(false);
      setMessage("Recipe created successfully :)");
    } catch (err: any) {
      setIsPending(false);
      setError(err.message);
      return console.error(
        "Error while creating recipe",
        err.message,
        err.statusCode || 500
      );
    }

    redirect(`/recipes/recipe#${recipeData._id}`, RedirectType.replace);
  }

  async function uploadRecipe(recipe: TYPE_RECIPE) {
    try {
      ///store new recipe in recipes database and user info database
      const recipeData = await getData("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      recipeData.newAccessToken &&
        userContext?.login(recipeData.newAccessToken);

      //connect the recipe data id to user recipe data id
      const userData = await getData("/api/users/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userContext?.accessToken}`,
        },
        body: JSON.stringify({ ...recipeData.data }),
      });

      userData.newAccessToken && userContext?.login(userData.newAccessToken);

      return recipeData.data;
    } catch (err) {
      throw err;
    }
  }

  return !isPending ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundImage:
          "linear-gradient(rgba(255, 241, 117, 1), rgba(255, 190, 117, 1))",
        width: "100%",
        height: "fit-content",
        padding: "2% 0",
      }}
    >
      {(error || message) && (
        <p
          style={{
            backgroundColor: error ? "orangered" : "rgba(112, 231, 0, 1)",
            color: "white",
            padding: mediaContext === "mobile" ? "1.5% 2%" : "0.7% 1%",
            borderRadius: "5px",
            fontSize: `calc(${fontSize} * 1.1)`,
            letterSpacing: "0.07vw",
            marginBottom: mediaContext === "mobile" ? "2%" : "1%",
          }}
        >
          {error || message}
        </p>
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
          image={mainImage}
          onChangeImage={handleChangeMainImage}
          deleteImage={handleDeleteMainImage}
          displayError={displayError}
        />
        <BriefExplanation
          mediaContext={mediaContext}
          recipeWidth={recipeWidth}
          fontSize={fontSize}
          favorite={favorite}
          onClickFavorite={handleClickFavorite}
        />
        <Ingredients
          mediaContext={mediaContext}
          fontSize={fontSize}
          headerSize={headerSize}
        />
        <Instructions
          mediaContext={mediaContext}
          recipeWidth={recipeWidth}
          fontSize={fontSize}
          headerSize={headerSize}
          marginTop={marginTop}
          images={instructionImages}
          addImage={handleAddInstrucionImage}
          deleteImage={handleDeleteInstructionImage}
          onChangeImage={handleChangeInstructionImage}
          deleteInstruction={handleDeleteInstruciton}
          displayError={displayError}
        />
        <AboutThisRecipe
          mediaContext={mediaContext}
          fontSize={fontSize}
          headerSize={headerSize}
          marginTop={marginTop}
        />
        <Memories
          mediaContext={mediaContext}
          recipeWidth={recipeWidth}
          fontSize={fontSize}
          headerSize={headerSize}
          marginTop={marginTop}
          images={memoryImages}
          onChangeImages={handleChangeMemoryImages}
          deleteImage={handleDeleteMemoryImage}
          displayError={displayError}
        />
        <Comments
          mediaContext={mediaContext}
          fontSize={fontSize}
          headerSize={headerSize}
          marginTop={marginTop}
        />
        <button
          className={styles.btn__upload_recipe}
          style={{ fontSize: headerSize, marginTop: headerSize }}
          type="submit"
        >
          Upload
        </button>
      </form>
    </div>
  ) : (
    <Loading message="Creating your recipe..." />
  );
}

function ImageTitle({
  mediaContext,
  recipeWidth,
  fontSize,
  image,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  image: TYPE_FILE | undefined;
  onChangeImage: (
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) => void;
  deleteImage: () => void;
  displayError: (error: string) => void;
}) {
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

      // onChangeImage(await getFileData(files[0]));
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

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      <button
        className={clsx(styles.btn__img, styles.btn__trash_img)}
        style={{
          top: mediaContext === "mobile" ? "101%" : "0",
          right: mediaContext === "mobile" ? "-10%" : "-8%",
          width: mediaContext === "mobile" ? "15%" : "7%",
          height: mediaContext === "mobile" ? "13%" : "9%",
          opacity: image ? 1 : 0,
        }}
        type="button"
        onClick={deleteImage}
      ></button>
      {!image ? (
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
                letterSpacing: mediaContext === "mobile" ? "0.2vw" : "0.05vw",
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
        <Image
          src={image.data}
          alt="main image"
          width={parseFloat(width)}
          height={parseFloat(height)}
        ></Image>
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
          height: "fit-content",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          backgroundImage:
            "linear-gradient(150deg, rgb(255, 230, 0) 10%,rgb(255, 102, 0))",
          letterSpacing: "0.1vw",
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
          }}
          name="title"
          placeholder="Click here to set title"
        ></input>
      </div>
    </div>
  );
}

function BriefExplanation({
  mediaContext,
  recipeWidth,
  fontSize,
  favorite,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  favorite: boolean;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false]);
  const [servingsUnit, setServingsUnit] =
    useState<TYPE_SERVINGS_UNIT>("people");
  const [tempKeys, setTempKeys] = useState(
    Array(NUMBER_OF_TEMPERATURES)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
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

  function handleChangeServingsUnit(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value as TYPE_SERVINGS_UNIT;
    setServingsUnit(value);
  }

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
            : "6% 0 5% 0 ",
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
          padding: "3%",
          backgroundColor: "rgb(255, 217, 0)",
          borderRadius: "5px",
          gap: "20%",
          boxShadow: "rgba(0, 0, 0, 0.27) 3px 3px 5px",
        }}
      >
        {mediaContext === "mobile" ? (
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
              />
              <select
                className={styles.input__brief_explanation}
                style={{ width: "40%", fontSize }}
                name="servingsUnit"
                onChange={handleChangeServingsUnit}
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
        ) : (
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
            />
            <select
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "25%" : "22%",
                fontSize,
              }}
              name="servingsUnit"
              onChange={handleChangeServingsUnit}
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
          >
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
        </div>
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
  // fontSizeBrief,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  // fontSizeBrief: string;
  i: number;
}) {
  return (
    <input
      className={styles.input__brief_explanation}
      style={{
        width: mediaContext === "mobile" ? "16%" : "18%",
        fontSize,
      }}
      type="number"
      name={`temperature${i + 1}`}
      placeholder={`${mediaContext === "mobile" ? "" : "Temp"} ${i + 1}`}
    ></input>
  );
}

function Ingredients({
  mediaContext,
  fontSize,
  headerSize,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
}) {
  const [numberOfLines, setNumberOfLines] = useState(1);
  const [lines, setLines] = useState<any[]>(
    Array(numberOfLines)
      .fill("")
      .map(() => {
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

        return [...prev].toSpliced(deletedIndex, 1);
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
          gridTemplateColumns: "auto",
          justifyItems: "left",
          marginTop: "2%",
          fontSize,
          wordSpacing: "0.1vw",
          // columnGap: "5%",
          columnGap: mediaContext === "tablet" ? "0" : "5%",
          rowGap:
            mediaContext === "mobile" ? `calc(${fontSize} * 2)` : fontSize,
          // paddingLeft: "7%",
        }}
      >
        {lines.map((line, i) => (
          <IngLine
            key={line.id}
            mediaContext={mediaContext}
            fontSize={fontSize}
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

        {/* {recipe.ingredients.map((ing: any) => {
                const newIng = ing.convertion[ingredientsUnit]
                  ? ing.convertion[ingredientsUnit]
                  : ing;

                return (
                  <div key={nanoid()} style={{width: '100%',
  height: 'fit-content',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'left',}}>
                    <input type="checkbox" />
                    <span>
                      {" "}
                      {typeof newIng.amount === "string" ||
                      newIng.unit === "g" ||
                      newIng.unit === "kg" ||
                      newIng.unit === "oz" ||
                      newIng.unit === "lb" ||
                      newIng.unit === "ml" ||
                      newIng.unit === "L"
                        ? newIng.amount
                        : fracty(newIng.amount)}{" "}
                      {newIng.unit} of {ing.ingredient}
                    </span>
                  </div>
                );
              })} */}
      </div>
    </div>
  );
}

function IngLine({
  mediaContext,
  fontSize,
  i,
  onClickDelete,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const [line, setLine] = useState({
    name: "",
    amount: 0,
    unit: "",
    customUnit: "",
  });

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;

    setLine((prev) => {
      const newLine = { ...prev };
      if (target.name.includes("Name")) newLine.name = target.value;
      if (target.name.includes("Amount")) newLine.amount = +target.value;
      if (target.name.includes("Unit") && !target.name.includes("CustomUnit"))
        newLine.unit = target.value;
      if (target.name.includes("CustomUnit")) newLine.customUnit = target.value;
      return newLine;
    });
  }

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "2%",
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
        value={line.name}
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
  images,
  addImage,
  deleteImage,
  onChangeImage,
  deleteInstruction,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  images: (TYPE_FILE | undefined)[];
  addImage: () => void;
  deleteImage: (index: number) => void;
  onChangeImage: (image: TYPE_FILE, index: number) => void;
  deleteInstruction: (index: number) => void;
  displayError: (error: string) => void;
}) {
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [instructions, setInstructions] = useState(
    Array(images.length)
      .fill("")
      .map(() => {
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
    //when user adds instruction
    if (instructions.length < images.length)
      setInstructions((prev) => [...prev, { id: nanoid() }]);

    //when user deletes instruction
    if (instructions.length > images.length)
      setInstructions((prev) => {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        const newInstructions = [...prev];
        return newInstructions.toSpliced(deletedIndex, 1);
      });
  }, [images.length]);

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
      {instructions.map((inst, i) => (
        <Instruction
          key={inst.id}
          mediaContext={mediaContext}
          recipeWidth={recipeWidth}
          fontSize={fontSize}
          i={i}
          image={images[i]}
          onClickDeleteImage={deleteImage}
          onClickDelete={handleClickDelete}
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
          onClickBtn={addImage}
        />
      </div>

      {/* {recipe.instructions.map((step: any, i: number) => (
              <div key={nanoid()} style={{width: '100%',
    height: 'fit-content',
    border: 'thin solid rgb(255, 174, 0)',
    padding: '3%',
    fontSize: '1.2vw',
    letterSpacing: '0.05vw'}}>
                <div styles={{ textAlign: 'left',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '3%',}}>
                  <p style={{whiteSpace: 'nowrap'}}>
                    <span style={{ fontSize: '1.4vw',
  borderRadius: '50%',
  padding: '0 2%',
  color: 'aliceblue',
  backgroundColor:'rgb(0, 132, 255)',}}>{i + 1}</span> {step.instruction}
                  </p>
                  {step.image && (
                    <Image
                      src={step.image || "/grey-img.png"}
                      alt={`step ${i + 1} image`}
                      width={100}
                      height={80}
                    ></Image>
                  )}
                </div>
              </div>
            ))} */}
    </div>
  );
}

function Instruction({
  mediaContext,
  recipeWidth,
  fontSize,
  i,
  image,
  onClickDeleteImage,
  onClickDelete,
  onChangeImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  i: number;
  image: TYPE_FILE | undefined;
  onClickDeleteImage: (i: number) => void;
  onClickDelete: (i: number) => void;
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
          fontSize,
          width: mediaContext === "mobile" ? "8%" : "5%",
          aspectRatio: "1",
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
      ></textarea>
      <div
        style={{ position: "relative", width: imageWidth, height: imageHeight }}
      >
        {!image ? (
          <div
            className={styles.grey_background}
            style={{ width: "100%", height: "100%" }}
          >
            <button
              className={clsx(styles.btn__img, styles.btn__upload_img)}
              style={{ width: "20%", height: "30%", top: "30%", left: "40%" }}
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
        ) : (
          <>
            <Image
              src={image.data}
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
          right: mediaContext === "mobile" ? "-13%" : "-20%",
          top: "44%",
          width: mediaContext === "mobile" ? "15%" : "18%",
          height: mediaContext === "mobile" ? "15%" : "18%",
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
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
}) {
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
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
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
  const [curImg, setCurImg] = useState(0);

  //design
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.9, "300px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.65, "400px")
      : getSize(recipeWidth, 0.55, "400px");
  const height = parseInt(width) * 0.55 + "px";

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

  function handleClickDot(i: number) {
    setCurImg(i);
  }

  function handleDeleteImg(i: number) {
    deleteImage(i);
    //if deleted img was the last img and not the only img, set curImg as one before the img, otherwise, one after the img
    setCurImg((prev) => (prev && images.length - 1 === prev ? prev - 1 : prev));
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
          width: "100%",
          height,
          overflow: "hidden",
        }}
      >
        {images.map((img, i) => (
          <MemoryImg
            key={nanoid()}
            width={width}
            height={height}
            i={i}
            image={img}
            translateX={calcTransitionXSlider(i, curImg)}
            onClickDelete={handleDeleteImg}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: calcTransitionXSlider(images.length, curImg),
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
          {/* add one for upload slide */}
          {[...images, ""].map((_, i) => (
            <button
              key={nanoid()}
              style={{
                opacity: "0.6",
                width: mediaContext === "mobile" ? "3.5%" : "3%",
                aspectRatio: "1",
                backgroundColor:
                  curImg === i ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                borderRadius: "50%",
                border: "none",
              }}
              type="button"
              onClick={() => handleClickDot(i)}
            ></button>
          ))}
          {/* {recipe.memoryImages.map((_: any, i: number) => (
                    <button
                      key={nanoid()}
                      className={styles.btn__dot}
                      style={{ opacity: i === curSlide ? "0.6" : "0.3" }}
                      onClick={() => handleClickDots(i)}
                    ></button>
                  ))} */}
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
      <Image
        src={image.data}
        alt={`memory image ${i + 1}`}
        width={parseFloat(width)}
        height={parseFloat(height)}
      ></Image>
    </div>
  );
}

function Comments({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
}) {
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
        ></textarea>
        {/* <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          textAlign: "left",
          fontSize: "1.3vw",
          letterSpacing: "0.05vw",
          padding: "3%",
        }}
        contentEditable="true"
        defaultValue="Use this space for free :)"
      >
        {}
      </div> */}
      </div>
    </div>
  );
}
