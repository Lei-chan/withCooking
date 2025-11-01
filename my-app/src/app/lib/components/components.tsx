"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Resizer from "react-image-file-resizer";
import { redirect, RedirectType } from "next/navigation";
import Image from "next/image";
import styles from "./component.module.css";
import {
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENT_UNIT,
  TYPE_INGREDIENTS,
  TYPE_INSTRUCTION,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
  TYPE_SERVINGS_UNIT,
  TYPE_USER_CONTEXT,
} from "../config/type";
import {
  MAX_SERVINGS,
  NUMBER_OF_TEMPERATURES,
  SLIDE_TRANSITION_SEC,
} from "../config/settings";
import {
  calcTransitionXSlider,
  getImageFileData,
  getIngGridTemplateColumnsStyle,
  getNextSlideIndex,
  getReadableIngUnit,
  getTemperatures,
  isRecipeAllowed,
  updateConvertion,
  updateIngsForServings,
  uploadRecipeUpdate,
} from "../helpers/recipes";
import { getData, getSize, wait } from "../helpers/other";
import { convertIngUnits } from "../helpers/converter";
import { MediaContext, UserContext } from "../providers";
import fracty from "fracty";
import { nanoid } from "nanoid";

export function MessageContainer({
  message,
  fontSize,
  letterSpacing,
  wordSpacing,
}: {
  message: string;
  fontSize: string;
  letterSpacing: string;
  wordSpacing: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "3% 5% 0 5%",
        textAlign: "center",
        justifyContent: "center",
        fontSize: fontSize,
        letterSpacing: letterSpacing,
        wordSpacing: wordSpacing,
        color: "rgb(190, 124, 0)",
        zIndex: "0",
      }}
    >
      <p>{message}</p>
    </div>
  );
}

export function OverlayMessage({
  option,
  content,
  toggleLogout,
}: {
  option: "message" | "question";
  content: "welcome" | "logout";
  toggleLogout?: () => void;
}) {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  const [isVisible, setIsVisible] = useState(true);

  const fontSize =
    mediaContext === "mobile"
      ? "4.4vw"
      : mediaContext === "tablet"
      ? "3vw"
      : "1.6vw";

  function getMessage() {
    let message;

    if (content === "welcome")
      message = (
        <p>
          Welcome!
          <br />
          It's nice to see you :)
          <br />
          Time to cook!
        </p>
      );

    if (content === "logout")
      message = <p>Are you sure you want to log out?</p>;

    return message;
  }

  //only for welcome message
  function handleClose() {
    setIsVisible(false);
  }

  //user log out
  function handleLogout() {
    userContext?.logout();

    redirect("/", RedirectType.replace);
  }

  return (
    <div
      style={{
        position: "fixed",
        display: isVisible ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.37)",
        backdropFilter: "blur(3px)",
        zIndex: "100",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width:
            mediaContext === "mobile"
              ? "85%"
              : mediaContext === "tablet"
              ? "67%"
              : "30%",
          height: "fit-content",
          minHeight: "30%",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(rgba(255, 235, 221, 1), rgba(255, 240, 172, 1))",
          fontSize: fontSize,
          letterSpacing: "0.08vw",
          lineHeight: option === "message" ? "150%" : "130%",
          padding: "2%",
          color: "navy",
          borderRadius: "7px",
        }}
      >
        <button
          className={styles.btn__x}
          style={{ fontSize: fontSize }}
          onClick={() => {
            content === "welcome" && handleClose();
            content === "logout" && toggleLogout && toggleLogout();
          }}
        >
          &times;
        </button>
        {getMessage()}
        {option === "question" && (
          <button
            className={styles.btn__question}
            style={{ fontSize: `calc(${fontSize} * 0.75)` }}
            onClick={handleLogout}
          >
            I'm sure
          </button>
        )}
      </div>
    </div>
  );
}

export function PaginationButtons({
  mediaContext,
  fontSize,
  styles,
  curPage,
  numberOfPages,
  isPending,
  onClickPagination,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  styles: any;
  curPage: number;
  numberOfPages: number;
  isPending: boolean;
  onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const fontSizePagination =
    mediaContext === "mobile"
      ? fontSize
      : mediaContext === "tablet"
      ? `calc(${fontSize} * 0.9)`
      : `calc(${fontSize} * 0.8)`;
  const padding =
    mediaContext === "mobile"
      ? "1% 2%"
      : mediaContext === "tablet"
      ? "0.7% 1.2%"
      : "0.5% 1%";
  return (
    <div className={styles.container__pagination}>
      {!isPending && curPage > 1 && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
          style={{ fontSize: fontSizePagination, padding }}
          value="decrease"
          onClick={onClickPagination}
        >
          {`Page ${curPage - 1}`}
          <br />
          &larr;
        </button>
      )}
      {!isPending && numberOfPages > curPage && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
          style={{ fontSize: fontSizePagination, padding }}
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

export function RecipeEdit({
  recipe,
  error,
  createOrUpdate,
  handleChangeEdit = undefined,
}: {
  recipe: TYPE_RECIPE;
  error: string;
  createOrUpdate: "create" | "update";
  handleChangeEdit?: (editOrNot: boolean) => void | undefined;
}) {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);
  //set favorite and images when user change them and set other fields when user submits the recipe
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>(recipe);

  const [isPending, setIsPending] = useState(false);
  const [curError, setCurError] = useState(error);
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
    setCurRecipe(recipe);
  }, [recipe]);

  useEffect(() => {
    setCurError(error);
  }, [error]);

  function displayError(errorMessage: string) {
    setCurError(errorMessage);
  }

  function handleChangeMainImage(
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.mainImage = mainImageFile;
      newRecipe.mainImagePreview = mainImagePreviewFile;
      return newRecipe;
    });
  }

  function handleDeleteMainImage() {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.mainImage = newRecipe.mainImagePreview = undefined;
      return newRecipe;
    });
  }

  function handleAddInstrucion() {
    setCurRecipe((prev) => {
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
      const newRecipe = { ...prev };
      newRecipe.instructions = prev.instructions.toSpliced(index, 1);
      return newRecipe;
    });
  }

  function handleChangeInstruction(value: string, i: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions[i].instruction = value;
      return newRecipe;
    });
  }

  function handleDeleteInstructionImage(index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions[index].image = undefined;
      return newRecipe;
    });
  }

  function handleChangeInstructionImage(file: TYPE_FILE, index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions[index].image = file;
      return newRecipe;
    });
  }

  function handleChangeMemoryImages(filesArr: TYPE_FILE[]) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.memoryImages = [...prev.memoryImages, ...filesArr];
      return newRecipe;
    });
  }

  function handleDeleteMemoryImage(index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.memoryImages = prev.memoryImages.toSpliced(index, 1);
      return newRecipe;
    });
  }

  function handleClickFavorite() {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.favorite = !prev.favorite;
      return newRecipe;
    });
  }

  console.log(curRecipe);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let recipeData;
    try {
      setIsPending(true);
      setCurError("");

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
      const instructions = curRecipe?.instructions.filter(
        (inst) => inst.instruction || inst.image
      );
      // const instructions = curRecipe.instructions
      //   .map((inst, i) => {
      //     return {
      //       instruction: String(formData.get(`instruction${i + 1}`)) || "",
      //       image: inst.image,
      //     };
      //   })
      //   .filter((inst) => inst.instruction || inst.image);

      const newRecipe = {
        _id: curRecipe._id || undefined,
        favorite: curRecipe.favorite,
        mainImage: curRecipe.mainImage,
        mainImagePreview: curRecipe.mainImagePreview,
        title: String(formData.get("title"))?.trim() || "",
        author: String(formData.get("author")).trim() || "",
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
        description: String(formData.get("description")).trim(),
        memoryImages: curRecipe.memoryImages,
        comments: String(formData.get("comments")).trim(),
        createdAt:
          createOrUpdate === "create"
            ? new Date().toISOString()
            : curRecipe.createdAt,
        updatedAt: new Date().toISOString(),
      };

      //store data before in case it disappears when error happens
      setCurRecipe(newRecipe);

      if (!isRecipeAllowed(newRecipe)) {
        const err: any = new Error("Please fill more than one input field!");
        err.statusCode = 400;
        throw err;
      }

      recipeData =
        createOrUpdate === "create"
          ? await uploadRecipeCreate(newRecipe)
          : await uploadRecipeUpdate(newRecipe, userContext);

      // setCurRecipe(recipeData);

      setIsPending(false);
      handleChangeEdit && handleChangeEdit(false);
      setMessage(
        `Recipe ${
          createOrUpdate === "create" ? "created" : "updated"
        } successfully :)`
      );
      if (createOrUpdate === "update") {
        await wait();
        setMessage("");
      }
    } catch (err: any) {
      setIsPending(false);
      setCurError(
        `Server error while creating recipe 🙇‍♂️ ${
          err.statusCode === 400 ? err.message : "Please try again this later"
        }`
      );
      return console.error(
        "Error while creating recipe",
        err.message,
        err.statusCode || 500
      );
    }

    createOrUpdate === "create" &&
      redirect(`/recipes/recipe#${recipeData._id}`, RedirectType.replace);
  }

  async function uploadRecipeCreate(recipe: TYPE_RECIPE) {
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

      userContext?.addNumberOfRecipes();

      return recipeData.data;
    } catch (err) {
      throw err;
    }
  }

  return !isPending ? (
    <>
      {(curError || message) && (
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSize}
          error={curError}
          message={message}
          mainOrRecipe="recipe"
        />
      )}

      {!curRecipe ? (
        <LoadingRecipe mediaContext={mediaContext} recipeWidth={recipeWidth} />
      ) : (
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
          <ImageTitleEdit
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            curTitle={curRecipe.title}
            curImage={curRecipe.mainImage}
            onChangeImage={handleChangeMainImage}
            deleteImage={handleDeleteMainImage}
            displayError={displayError}
          />
          <BriefExplanationEdit
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            curRecipe={curRecipe}
            onClickFavorite={handleClickFavorite}
          />
          <IngredientsEdit
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            ingredients={curRecipe.ingredients}
            regionUnit="original"
          />
          <InstructionsEdit
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
            deleteImage={handleDeleteInstructionImage}
            onChangeImage={handleChangeInstructionImage}
            displayError={displayError}
          />
          <AboutThisRecipeEdit
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            curDescription={curRecipe.description}
          />
          <MemoriesEdit
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
          <CommentsEdit
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            curComments={curRecipe.comments}
          />
          <button
            className={styles.btn__upload_recipe}
            style={{ fontSize: headerSize, marginTop: headerSize }}
            type="submit"
          >
            Upload
          </button>
        </form>
      )}
    </>
  ) : (
    <Loading
      message={`${
        createOrUpdate === "create" ? "Creating" : "Updating"
      } your recipe...`}
    />
  );
}

export function ErrorMessageRecipe({
  mediaContext,
  fontSize,
  error,
  message,
  mainOrRecipe,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  error: string;
  message: string;
  mainOrRecipe: "main" | "recipe";
}) {
  return (
    <p
      style={{
        backgroundColor: error ? "orangered" : "rgba(112, 231, 0, 1)",
        color: "white",
        padding:
          mainOrRecipe === "main"
            ? "0.7% 1%"
            : mediaContext === "mobile"
            ? "1.5% 2%"
            : "0.7% 1%",
        borderRadius: "5px",
        fontSize: `calc(${fontSize} * ${mainOrRecipe === "main" ? 0.9 : 1.1})`,
        letterSpacing: "0.07vw",
        marginBottom: mediaContext === "mobile" ? "2%" : "1%",
        // marginBottom: "1%",
      }}
    >
      {error || message}
    </p>
  );
}

export function BtnFavorite({
  mediaContext,
  favorite,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  favorite: boolean;
  onClickFavorite: () => void;
}) {
  return (
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
  );
}

function ImageTitleEdit({
  mediaContext,
  recipeWidth,
  fontSize,
  curTitle,
  curImage,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  curTitle: string;
  curImage: TYPE_FILE | undefined;
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

  const [title, setTitle] = useState(curTitle);

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setTitle(value);
  }

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

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      {!curImage?.data ? (
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
        <>
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{
              top: mediaContext === "mobile" ? "102%" : "0",
              right: mediaContext === "mobile" ? "-5%" : "-8%",
              width: mediaContext === "mobile" ? "10%" : "7%",
              height: mediaContext === "mobile" ? "11%" : "9%",
              opacity: curImage ? 1 : 0,
            }}
            type="button"
            onClick={deleteImage}
          ></button>
          <Image
            src={curImage.data}
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
            color: "rgb(60, 0, 116)",
          }}
          name="title"
          placeholder="Click here to set title"
          value={title}
          onChange={handleChangeTitle}
        ></input>
      </div>
    </div>
  );
}

function BriefExplanationEdit({
  mediaContext,
  recipeWidth,
  fontSize,
  curRecipe,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  curRecipe: TYPE_RECIPE;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false]);
  const [author, setAuthour] = useState(curRecipe.author);
  const [servings, setServings] = useState(curRecipe.servings.servings);
  const [servingsUnit, setServingsUnit] = useState<TYPE_SERVINGS_UNIT>(
    (curRecipe.servings.unit || "people") as TYPE_SERVINGS_UNIT
  );
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe.servings.customUnit
  );
  const [temperatureUnit, setTemperatureUnit] = useState(
    curRecipe.temperatures.unit
  );

  // const [tempKeys, setTempKeys] = useState(
  //   Array(NUMBER_OF_TEMPERATURES)
  //     .fill("")
  //     .map((_) => {
  //       return { id: nanoid() };
  //     })
  // );

  //design
  const width = getSize(recipeWidth, 0.9, "90%");
  const fontSizeBrief = parseFloat(fontSize) * 0.95 + "px";
  const iconSize = parseFloat(fontSizeBrief);
  const fontFukidashiSize = `calc(${fontSizeBrief} * 0.9)`;

  // useEffect(() => {
  //   setAuthour(curRecipe.author);
  //   setServings(curRecipe.servings.servings);
  //   setServingsUnit(curRecipe.servings.unit as TYPE_SERVINGS_UNIT);
  //   setServingsCustomUnit(curRecipe.servings.customUnit);
  //   setTemperatureUnit(curRecipe.temperatures.unit);
  // }, [curRecipe]);

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
    if (target.name === "servings") setServings(+value);
    if (target.name === "servingsUnit")
      setServingsUnit(value as TYPE_SERVINGS_UNIT);
    if (target.name === "servingsCustomUnit") setServingsCustomUnit(value);
    if (target.name === "temperatureUnit") {
      (value === "℉" || value === "℃") && setTemperatureUnit(value);
    }
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
                key={nanoid()}
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
                value={servings || ""}
                onChange={handleChangeInput}
              />
              <select
                className={styles.input__brief_explanation}
                style={{ width: "40%", fontSize }}
                name="servingsUnit"
                value={servingsUnit}
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
                  value={servingsCustomUnit}
                  onChange={handleChangeInput}
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
              value={servings || ""}
              onChange={handleChangeInput}
            />
            <select
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "25%" : "22%",
                fontSize,
              }}
              name="servingsUnit"
              value={servingsUnit}
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
                value={servingsCustomUnit}
                onChange={handleChangeInput}
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
          {Array(NUMBER_OF_TEMPERATURES)
            .fill("")
            .map((_, i) => (
              <InputTempEdit
                // key={keyObj.id}
                key={i}
                mediaContext={mediaContext}
                fontSize={fontSize}
                temperature={
                  curRecipe.temperatures.temperatures[i] || undefined
                }
                i={i}
              />
            ))}
          {/* {tempKeys.map((keyObj, i) => (
            <InputTempEdit
              key={keyObj.id}
              mediaContext={mediaContext}
              fontSize={fontSize}
              temperature={curRecipe.temperatures.temperatures[i]}
              i={i}
            />
          ))} */}
          <select
            className={styles.input__brief_explanation}
            style={{
              width: "fit-content",
              fontSize,
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
        favorite={curRecipe.favorite}
        onClickFavorite={onClickFavorite}
      />
    </div>
  );
}

function InputTempEdit({
  mediaContext,
  fontSize,
  temperature,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  temperature: number | undefined;
  i: number;
}) {
  const [temp, setTemp] = useState(temperature);

  function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setTemp(value !== "" ? +value : undefined);
  }

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
      value={temp !== undefined ? temp : ""}
      onChange={handleChangeTemp}
    ></input>
  );
}

function IngredientsEdit({
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

  ////Manually update lines to remain current state when users delete line
  useEffect(() => {
    setLines((prev) => {
      ///when line is added
      if (prev.length < numberOfLines) return [...prev, { id: nanoid() }];

      ///when line is deleted
      if (prev.length > numberOfLines) {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        return [...prev].toSpliced(deletedIndex, 1);
      }

      return prev;
    });
  }, [numberOfLines, deletedIndex]);

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
          <IngLineEdit
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

function IngLineEdit({
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

function InstructionsEdit({
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
  instructions: TYPE_INSTRUCTION[] | [];
  addInstruction: () => void;
  deleteInstruction: (index: number) => void;
  onChangeInstruction: (value: string, i: number) => void;
  deleteImage: (index: number) => void;
  onChangeImage: (image: TYPE_FILE, index: number) => void;
  displayError: (error: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [instructionKeys, setInstructionKeys] = useState(
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
    setInstructionKeys((prev) => {
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
          backgroundColor: "rgba(240, 235, 172, 0.91)",
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
      {instructionKeys.length !== 0 &&
        instructionKeys.map((keyObj, i) => (
          <InstructionEdit
            key={keyObj.id}
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            i={i}
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

function InstructionEdit({
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
  instruction: TYPE_INSTRUCTION;
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
        value={instruction.instruction}
        onChange={handleChangeInstruction}
      ></textarea>
      <div
        style={{ position: "relative", width: imageWidth, height: imageHeight }}
      >
        {!instruction.image?.data ? (
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

function AboutThisRecipeEdit({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
  curDescription,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  curDescription: string;
}) {
  const [description, setDescription] = useState(curDescription);

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

function MemoriesEdit({
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
          <MemoryImgEdit
            key={i}
            width={width}
            height={height}
            image={img}
            i={i}
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
              key={i}
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
        </div>
      </div>
    </div>
  );
}

function MemoryImgEdit({
  width,
  height,
  image,
  i,
  translateX,
  onClickDelete,
}: {
  width: string;
  height: string;
  image: TYPE_FILE;
  i: number;
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

function CommentsEdit({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
  curComments,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  curComments: string;
}) {
  const [comments, setComments] = useState(curComments);

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

export function RecipeNoEdit({
  mediaContext,
  userContext,
  recipeWidth,
  error,
  mainOrRecipe,
  userRecipe = null,
}: {
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  recipeWidth: string;
  error: string;
  mainOrRecipe: "main" | "recipe";
  userRecipe: TYPE_RECIPE | null;
}) {
  ///design
  const fontSize =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.045, "4.5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.035, "2.7vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(recipeWidth, 0.031, "1.5vw")
      : getSize(recipeWidth, 0.028, "1.3vw");
  const headerSize =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.05, "5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.04, "3.5vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(recipeWidth, 0.035, "1.5vw")
      : getSize(recipeWidth, 0.032, "1.3vw");
  const marginTop = getSize(recipeWidth, 0.11, "30px");

  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE | null>(userRecipe);
  //use curRecipe to modify the recipe value
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE | null>(userRecipe);
  const [favorite, setFavorite] = useState<boolean | undefined>(
    userRecipe?.favorite
  );
  const [servingsValue, setServingsValue] = useState<number | undefined>(
    userRecipe?.servings.servings
  );
  const [regionUnit, setRegionUnit] = useState<TYPE_REGION_UNIT>("original");

  const [isLoading, setIsLoading] = useState<boolean>();
  const [curError, setCurError] = useState(error);
  const [successMessage, setSuccessMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    userRecipe && setStateInit(userRecipe);
  }, [userRecipe]);

  function setStateInit(recipe: TYPE_RECIPE) {
    setRecipe(recipe);
    setCurRecipe(recipe);
    setFavorite(recipe.favorite);
    setServingsValue(recipe.servings.servings);
    setRegionUnit("original");
  }

  //Only for main
  useEffect(() => {
    if (mainOrRecipe === "recipe") return;

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  async function handleHashChange() {
    const id = window.location.hash.slice(1);
    if (!id)
      return setMessage("Let's start cooking by selecting your recipe :)");
    await getRecipe(id);
  }

  async function getRecipe(id: string) {
    try {
      setIsLoading(true);
      setCurError("");
      const recipeData = await getData(`/api/recipes?id=${id}`, {
        method: "GET",
      });

      setStateInit(recipeData.data);

      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setCurError(err.message);
      console.error(
        "Error while loading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  function handleChangeServings(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);

    if (!recipe) return;
    setCurRecipe((prev: any) => {
      const newRecipe = { ...recipe };
      newRecipe.ingredients = updateIngsForServings(newValue, recipe);
      //update convertion for updated ing amount
      return updateConvertion(newRecipe);
    });
  }

  function handleChangeIngredientsUnit(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const value = e.currentTarget.value as TYPE_REGION_UNIT;
    setRegionUnit(value);
  }

  console.log(curRecipe);
  //update recipe only edit is false
  async function handleClickFavorite() {
    try {
      setFavorite(!favorite);
      setCurError("");
      setSuccessMessage("Updating favorite status...");
      if (!recipe) return;

      const newRecipe = { ...recipe };
      newRecipe.favorite = !favorite;

      const recipeData = await uploadRecipeUpdate(newRecipe, userContext);
      setStateInit(recipeData);

      setSuccessMessage("Favorite status updated successfully!");
      await wait();
      setSuccessMessage("");
    } catch (err: any) {
      setSuccessMessage("");
      setCurError(`Server error while updating recipe 🙇‍♂️ ${err.message}`);
      console.error(
        "Error while updating recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  return (
    <>
      {(error || successMessage) && (
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSize}
          error={curError}
          message={successMessage}
          mainOrRecipe={mainOrRecipe}
        />
      )}
      {(isLoading ||
        !recipe ||
        !curRecipe ||
        (!servingsValue && servingsValue !== 0) ||
        favorite === undefined) &&
      mainOrRecipe === "main" ? (
        <MessageContainer
          message={isLoading ? "Loading your recipe..." : message}
          fontSize={`calc(${fontSize} * 1.3)`}
          letterSpacing={"0.05vw"}
          wordSpacing={"0.3vw"}
        />
      ) : (
        <form
          style={{
            position: "relative",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: mainOrRecipe === "main" ? "100%" : recipeWidth,
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding:
              mainOrRecipe === "main"
                ? mediaContext === "mobile"
                  ? "10% 0"
                  : mediaContext === "tablet"
                  ? "6% 0"
                  : "3% 0"
                : mediaContext === "mobile"
                ? "6% 0"
                : "3% 0",
            borderRadius:
              mainOrRecipe === "main"
                ? "0"
                : mediaContext === "mobile"
                ? "5px"
                : "10px",
            color: "black",
            boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
          }}
        >
          <ImageTitleNoEdit
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            image={recipe?.mainImage}
            title={recipe?.title || ""}
          />
          <BriefExplanationNoEdit
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            curRecipe={curRecipe}
            originalServingsValue={recipe?.servings.servings || 0}
            servingsValue={servingsValue || 0}
            favorite={favorite || false}
            regionUnit={regionUnit}
            onChangeServings={handleChangeServings}
            onChangeIngredientsUnit={handleChangeIngredientsUnit}
            onClickFavorite={handleClickFavorite}
          />
          <IngredientsNoEdit
            mediaContext={mediaContext}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            headerSize={headerSize}
            servingsValue={servingsValue || 0}
            ingredients={curRecipe?.ingredients || []}
            regionUnit={regionUnit}
          />
          <InstructionsNoEdit
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            preparation={recipe?.preparation || ""}
            instructions={recipe?.instructions || []}
          />
          <AboutThisRecipeNoEdit
            mediaContext={mediaContext}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            description={recipe?.description || ""}
          />
          <MemoriesNoEdit
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            images={recipe?.memoryImages || []}
          />
          <CommentsNoEdit
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            comments={recipe?.comments || ""}
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
        </form>
      )}
    </>
  );
}

function ImageTitleNoEdit({
  mediaContext,
  recipeWidth,
  mainOrRecipe,
  fontSize,
  image,
  title,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  image: TYPE_FILE | undefined;
  title: string;
}) {
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, mainOrRecipe === "main" ? 0.8 : 0.82, "250px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, mainOrRecipe === "main" ? 0.72 : 0.74, "400px")
      : getSize(recipeWidth, mainOrRecipe === "main" ? 0.65 : 0.7, "440px");

  const height =
    parseInt(width) *
      (mediaContext === "mobile"
        ? 0.65
        : mainOrRecipe === "recipe" && mediaContext === "tablet"
        ? 0.63
        : 0.6) +
    "px";

  return (
    <div
      style={{
        position: "relative",
        width: width,
        height: height,
      }}
    >
      {!image?.data ? (
        <div
          className={styles.grey_background}
          style={{ width: width, height: height }}
        ></div>
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
          minHeight: `calc(${fontSize} * 2)`,
          maxHeight: "fit-content",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          backgroundImage:
            "linear-gradient(150deg, rgb(255, 230, 0) 10%,rgb(255, 102, 0))",
          padding: "1% 3.5%",
          transform: "skewX(-17deg)",
          zIndex: "2",
        }}
      >
        <p
          style={{
            width: "100%",
            height: "100%",
            fontSize: `calc(${fontSize} * 1.5)`,
            letterSpacing: "0.1vw",
            textAlign: "center",
            color: "rgb(60, 0, 116)",
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

function BriefExplanationNoEdit({
  mediaContext,
  recipeWidth,
  mainOrRecipe,
  fontSize,
  curRecipe,
  originalServingsValue,
  servingsValue,
  regionUnit,
  favorite,
  onChangeServings,
  onChangeIngredientsUnit,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  curRecipe: TYPE_RECIPE | null;
  originalServingsValue: number;
  servingsValue: number;
  regionUnit: TYPE_REGION_UNIT;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIngredientsUnit: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickFavorite: () => void;
}) {
  const width = getSize(recipeWidth, 0.9, "90%");
  const fontSizeBrief =
    parseFloat(fontSize) * (mainOrRecipe === "main" ? 0.9 : 0.95) + "px";
  const iconSize = parseFloat(fontSizeBrief);
  const fontFukidashiSize = `calc(${fontSizeBrief} * 0.9)`;

  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [servingsUnit, setServingsUnit] = useState(curRecipe?.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe?.servings.customUnit
  );
  const [temperaturs, setTemperatures] = useState(
    curRecipe?.temperatures.temperatures.join(" / ")
  );
  const [temperatureUnit, setTemperatureUnit] = useState<"℉" | "℃">(
    curRecipe?.temperatures.unit || "℉"
  );

  useEffect(() => {
    if (!curRecipe) return;

    setServingsUnit(curRecipe.servings.unit);
    setServingsCustomUnit(curRecipe.servings.customUnit);
    setTemperatures(curRecipe.temperatures.temperatures.join(" / "));
    setTemperatureUnit(curRecipe.temperatures.unit);
  }, [curRecipe]);

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
    if (!curRecipe) return;

    const newTemps = getTemperatures(
      curRecipe.temperatures.temperatures,
      curRecipe.temperatures.unit,
      temperatureUnit
    );
    setTemperatures(newTemps);
  }, [curRecipe, temperatureUnit]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width,
        // aspectRatio: "1/0.1",
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
        <div
          className={styles.container__author_servings}
          style={{
            // gap: mediaContext === "mobile" ? "6%" : "2%"
            gap: mediaContext === "mobile" ? "4%" : "2%",
            marginBottom: "2%",
          }}
        >
          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-275%" : "-295%",
              left: mainOrRecipe === "main" ? "0%" : "-13%",
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
          <span
            style={{
              width: mainOrRecipe === "main" ? "19%" : "25%",
              fontSize: fontSizeBrief,
            }}
          >
            {curRecipe?.author || ""}
          </span>
          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-290%" : "-300%",
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
              value={servingsValue}
              onChange={onChangeServings}
            />
          )}
          <span style={{ width: "20%", fontSize: fontSizeBrief }}>
            {servingsUnit !== "other" ? servingsUnit : servingsCustomUnit}
          </span>
        </div>
        <div
          className={styles.container__units}
          style={{
            gap:
              mediaContext === "mobile"
                ? mainOrRecipe === "main"
                  ? "5%"
                  : "4%"
                : "2%",
          }}
        >
          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-280%" : "-295%",
              left: mainOrRecipe === "main" ? "0%" : "13%",
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
            style={{
              width: mainOrRecipe === "main" ? "25%" : "30%",
              fontSize: fontSizeBrief,
            }}
            name="region"
            value={regionUnit}
            onChange={onChangeIngredientsUnit}
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
              top: mediaContext === "mobile" ? "-275%" : "-295%",
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
      </div>
      <BtnFavorite
        mediaContext={mediaContext}
        favorite={favorite}
        onClickFavorite={onClickFavorite}
      />
    </div>
  );
}

function IngredientsNoEdit({
  mediaContext,
  mainOrRecipe,
  fontSize,
  headerSize,
  servingsValue,
  ingredients,
  regionUnit,
}: {
  mediaContext: TYPE_MEDIA;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  headerSize: string;
  servingsValue: number;
  ingredients: TYPE_INGREDIENTS;
  regionUnit: TYPE_REGION_UNIT;
}) {
  return (
    <div
      style={{
        position: "relative",
        width:
          mainOrRecipe === "recipe" && mediaContext === "mobile"
            ? "93%"
            : "90%",
        height: "fit-content",
        backgroundColor: "rgb(255, 247, 177)",
        padding: "2% 2% 8% 2%",
        borderRadius: "3px",
        overflowX: "auto",
      }}
    >
      <h2
        className={styles.header}
        style={{
          fontSize: headerSize,
          marginBottom: `calc(${headerSize} * ${
            mainOrRecipe === "main" ? 0.5 : 1
          })`,
        }}
      >
        Ingredients
      </h2>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: getIngGridTemplateColumnsStyle(
            ingredients,
            regionUnit,
            mediaContext,
            false
          ),
          justifyItems: "left",
          marginTop: "2%",
          wordSpacing: "0.1vw",
          columnGap: mediaContext === "tablet" ? "0" : "5%",
          rowGap: mainOrRecipe === "main" ? "0" : "1%",
        }}
      >
        {ingredients.map((ing, i) => (
          <IngLineNoEdit
            key={i}
            fontSize={fontSize}
            servingsValue={servingsValue}
            ingredient={ing}
            regionUnit={regionUnit}
          />
        ))}
      </div>
    </div>
  );
}

function IngLineNoEdit({
  fontSize,
  servingsValue,
  ingredient,
  regionUnit,
}: {
  fontSize: string;
  servingsValue: number;
  ingredient: TYPE_INGREDIENT;
  regionUnit: TYPE_REGION_UNIT;
}) {
  const [newIngredient, setNewIngredient] = useState<{
    amount: number;
    unit: string;
  }>({
    amount: ingredient.amount,
    unit: getReadableIngUnit(ingredient.unit),
  });

  useEffect(() => {
    const convertedIng = ingredient.convertion[regionUnit];

    //Not applicable converted ingredients unit => ingrediet otherwise converted ingredient
    const newIngredient = !convertedIng
      ? {
          amount: ingredient.amount,
          unit: getReadableIngUnit(ingredient.unit),
        }
      : {
          amount: convertedIng.amount,
          unit: getReadableIngUnit(convertedIng.unit),
        };
    setNewIngredient(newIngredient);
  }, [ingredient, servingsValue, regionUnit]);

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "4%",
        whiteSpace: "nowrap",
        fontSize,
      }}
    >
      <input
        style={{
          width: `calc(${fontSize} * 0.8)`,
          height: `calc(${fontSize} * 0.8)`,
          marginLeft: "2%",
        }}
        type="checkbox"
      ></input>
      <p>
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
    </div>
  );
}

function InstructionsNoEdit({
  mediaContext,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  preparation,
  instructions,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  preparation: string;
  instructions: { instruction: string; image: TYPE_FILE | undefined }[];
}) {
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
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        Instructions
      </h2>
      {preparation && (
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
          <p
            style={{
              width: "95%",
              height: "fit-content",
              resize: "none",
              border: "none",
              backgroundColor: "transparent",
              padding: "2%",
              fontSize,
              letterSpacing: "0.05vw",
              whiteSpace: "break-spaces",
              textAlign: "left",
            }}
          >
            {preparation}
          </p>
        </div>
      )}
      {instructions.length ? (
        instructions.map((inst, i) => (
          <InstructionNoEdit
            key={i}
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            instruction={inst}
            i={i}
          />
        ))
      ) : (
        <p className={styles.no_content} style={{ fontSize }}>
          There're no instructions
        </p>
      )}
    </div>
  );
}

function InstructionNoEdit({
  mediaContext,
  recipeWidth,
  fontSize,
  instruction,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  instruction: { instruction: string; image: TYPE_FILE | undefined };
  i: number;
}) {
  const [imageWidth, setImageWidth] = useState(
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.28, "100px")
      : getSize(recipeWidth, 0.22, "140px")
  );
  const [imageHeight, setImageHeaight] = useState(
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.2, "70px")
      : getSize(recipeWidth, 0.15, "100px")
  );

  useEffect(() => {
    const imageWidth =
      mediaContext === "mobile"
        ? getSize(recipeWidth, 0.28, "100px")
        : getSize(recipeWidth, 0.22, "140px");
    const imageHeight =
      mediaContext === "mobile"
        ? getSize(recipeWidth, 0.2, "70px")
        : getSize(recipeWidth, 0.15, "100px");

    setImageWidth(imageWidth);
    setImageHeaight(imageHeight);
  }, [recipeWidth]);

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
        letterSpacing: "0.06vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          width: mediaContext === "mobile" ? "8%" : "5%",
          aspectRatio: "1",
          borderRadius: "50%",
          fontSize,
          color: "white",
          backgroundColor: " #ce3a00e7 ",
        }}
      >
        {i + 1}
      </span>
      <p
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: instruction.image ? "55%" : "100%",
          height: "100px",
          letterSpacing: "0.03vw",
          fontSize,
          padding: instruction.image?.data ? "0 1%" : "0 0 0 3%",
        }}
      >
        {instruction.instruction}
      </p>
      <div
        style={{
          position: "relative",
          width: instruction.image?.data ? imageWidth : "0",
          height: imageHeight,
        }}
      >
        {instruction.image?.data && (
          <Image
            src={instruction.image.data}
            alt={`instruction ${i + 1} image`}
            width={parseInt(imageWidth)}
            height={parseInt(imageHeight)}
          ></Image>
        )}
      </div>
    </div>
  );
}

function AboutThisRecipeNoEdit({
  mediaContext,
  mainOrRecipe,
  fontSize,
  headerSize,
  marginTop,
  description,
}: {
  mediaContext: TYPE_MEDIA;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  headerSize: string;
  marginTop: string;
  description: string;
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
          backgroundColor: description ? "rgb(255, 247, 133)" : "transparent",
          width: mediaContext === "mobile" ? "90%" : "85%",
          aspectRatio: "1/0.28",
          fontSize,
          letterSpacing: mainOrRecipe === "main" ? "0.03vw" : "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: "auto",
          scrollbarColor: "rgb(255, 247, 133) rgba(255, 209, 2, 1)",
        }}
      >
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
      </div>
    </div>
  );
}

function MemoriesNoEdit({
  mediaContext,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  images,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  images: [] | TYPE_FILE[];
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
    if (!images.length) return;
    if (timeourId) clearInterval(timeourId);

    const id = setTimeout(() => {
      const nextSlide = getNextSlideIndex(curImage, MAX_SLIDE);
      setCurImage(nextSlide);
    }, SLIDE_TRANSITION_SEC * 1000);

    setTimeoutId(id);
  }, [curImage]);

  function handleClickDot(i: number) {
    setCurImage(i);
  }

  return (
    <div
      style={{
        position: "relative",
        marginTop,
        width:
          mediaContext === "mobile"
            ? "90%"
            : mediaContext === "tablet"
            ? "65%"
            : "55%",
        height: images.length
          ? `calc(${headerSize} * 2 + ${height})`
          : `calc(${height} * 0.8)`,
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
          height: images.length
            ? height
            : `calc(${height} * 0.8 - ${headerSize} * 2)`,
          overflow: "hidden",
        }}
      >
        {images.length !== 0 &&
          images.map((img, i) => (
            <MemoryImgNoEdit
              key={i}
              width={width}
              height={height}
              i={i}
              image={img}
              translateX={calcTransitionXSlider(i, curImage)}
            />
          ))}
        {images.length ? (
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
            {images.map((_, i) => (
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
          <p className={styles.no_content} style={{ fontSize, height: "100%" }}>
            There're no memory images
          </p>
        )}
      </div>
    </div>
  );
}

function MemoryImgNoEdit({
  width,
  height,
  i,
  image,
  translateX,
}: {
  width: string;
  height: string;
  i: number;
  image: TYPE_FILE;
  translateX: string;
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
      {image?.data && (
        <Image
          src={image.data}
          alt={`memory image ${i + 1}`}
          width={parseInt(width)}
          height={parseInt(height)}
        ></Image>
      )}
    </div>
  );
}

function CommentsNoEdit({
  mediaContext,
  fontSize,
  headerSize,
  marginTop,
  comments,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  comments: string;
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
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        Comments
      </h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor: comments ? "rgb(255, 253, 222)" : "transparent",
        }}
      >
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
      </div>
    </div>
  );
}

export function LoadingRecipe({
  mediaContext,
  recipeWidth,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
}) {
  return (
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
  );
}

export function Loading({ message }: { message: string }) {
  const mediaContext = useContext(MediaContext);

  const imageSize =
    mediaContext === "mobile"
      ? 100
      : mediaContext === "tablet"
      ? 130
      : mediaContext === "desktop"
      ? 150
      : 180;

  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 174, 0, 1)",
        zIndex: "100",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "15%",
          width: "40%",
          height: "40%",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize:
              mediaContext === "mobile"
                ? "5vw"
                : mediaContext === "tablet"
                ? "2.7vw"
                : mediaContext === "desktop"
                ? "1.8vw"
                : "1.5vw",
            letterSpacing: "0.08vw",
            textAlign: "center",
          }}
        >
          {message}
        </p>
        <Image
          className={styles.img__uploading}
          src="/loading.png"
          alt="loading icon"
          width={imageSize}
          height={imageSize}
          priority
        ></Image>
      </div>
    </div>
  );
}
