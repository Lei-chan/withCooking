"use client";
import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { redirect, RedirectType } from "next/navigation";
import Image from "next/image";
import styles from "./component.module.css";
import {
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
  TYPE_USER_CONTEXT,
} from "../config/type";
import { MediaContext, UserContext } from "../providers";
import {
  calcTransitionXSlider,
  getIngGridTemplateColumnsStyle,
  getNextSlideIndex,
  getReadableIngUnit,
  getTemperatures,
  updateConvertion,
  updateIngsForServings,
  uploadRecipe,
} from "../helpers/recipes";
import { MAX_SERVINGS, SLIDE_TRANSITION_SEC } from "../config/settings";
import { getData, getSize, wait } from "../helpers/other";
import fracty from "fracty";

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

export function RecipeNoEdit({
  mediaContext,
  userContext,
  recipeWidth,
  mainOrRecipe,
  userRecipe = null,
}: {
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  recipeWidth: string;
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
  const [error, setError] = useState("");
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
      setError("");
      const recipeData = await getData(`/api/recipes?id=${id}`, {
        method: "GET",
      });

      setStateInit(recipeData.data);

      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
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

  //update recipe only edit is false
  async function handleClickFavorite() {
    try {
      setFavorite(!favorite);
      setError("");
      setSuccessMessage("Updating favorite status...");
      if (!recipe) return;

      const newRecipe = { ...recipe };
      newRecipe.favorite = !favorite;

      const recipeData = await uploadRecipe(newRecipe, userContext);
      setStateInit(recipeData);

      setSuccessMessage("Favorite status updated successfully!");
      await wait();
      setSuccessMessage("");
    } catch (err: any) {
      setSuccessMessage("");
      setError(`Server error while updating recipe 🙇‍♂️ ${err.message}`);
      console.error(
        "Error while updating recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  // async function handleClickFavorite() {
  //   setFavorite(!favorite);

  //   if (!recipe) return;

  //   const newRecipe = { ...recipe };
  //   newRecipe.favorite = !favorite;

  //   uploadRecipe(newRecipe, userContext);
  // }

  return (
    <>
      {(error || successMessage) && (
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSize}
          error={error}
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
          <ImageTitle
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            image={recipe?.mainImage}
            title={recipe?.title || ""}
          />
          <BriefExplanation
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
          <Ingredients
            mediaContext={mediaContext}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            headerSize={headerSize}
            servingsValue={servingsValue || 0}
            ingredients={curRecipe?.ingredients || []}
            regionUnit={regionUnit}
          />
          <Instructions
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            preparation={recipe?.preparation || ""}
            instructions={recipe?.instructions || []}
          />
          <AboutThisRecipe
            mediaContext={mediaContext}
            mainOrRecipe={mainOrRecipe}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            description={recipe?.description || ""}
          />
          <Memories
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            images={recipe?.memoryImages || []}
          />
          <Comments
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

function ImageTitle({
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

function BriefExplanation({
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
  curRecipe: TYPE_RECIPE | undefined;
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

function Ingredients({
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
          <IngLine
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

function IngLine({
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

function Instructions({
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
          <Instruction
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

function Instruction({
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

function AboutThisRecipe({
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

function Memories({
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
            <MemoryImg
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

function MemoryImg({
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

function Comments({
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
