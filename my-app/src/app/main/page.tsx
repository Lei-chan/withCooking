"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState, useContext } from "react";
import { nanoid } from "nanoid";
import fracty from "fracty";
import { AccessTokenContext } from "../context";
import {
  getData,
  createMessage,
  uploadRecipe,
  getTemperatures,
  getOrderedRecipes,
  calcNumberOfPages,
  getFilteredRecipes,
  getRecipesPerPage,
  convertTempUnits,
  convertIngUnits,
  calcTransitionXSlider,
  updateConvertion,
  updateIngsForServings,
  getReadableIngUnit,
} from "../helper";
import {
  MAX_SERVINGS,
  TYPE_RECIPE,
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
} from "../config";
import DropdownMenu from "./(dropdown)/page";
import { MessageContainer } from "../components";
import { relative } from "path";

export default function MAIN() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchRef = useRef(null);
  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const [recipeWidth, setRecipeWidth] = useState("50%");
  const [timerHeight, setTimerHeight] = useState("65%");

  function handleMouseDownX() {
    setIsDraggingX(true);
  }

  function handleMouseDownY() {
    setIsDraggingY(true);
  }

  function handleMouseUp() {
    setIsDraggingX(false);
    setIsDraggingY(false);
  }

  function handleMouseMoveRecipe(e: React.MouseEvent<HTMLDivElement>) {
    if (isDraggingX) {
      const positioX = e.clientX;
      setRecipeWidth(`${positioX}px`);
    }

    if (isDraggingY) {
      const positionY = e.clientY;
      setTimerHeight(`${positionY}px`);
    }
  }

  const handleToggleDropdown = function () {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleToggleSearch = function () {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleCloseDropdownSearch = function (
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const target = e.target as HTMLElement;

    if (
      target.closest("ul") ||
      target.closest("div") === searchRef.current ||
      (!isDropdownVisible && !isSearchVisible)
    )
      return;

    setIsDropdownVisible(false);
    setIsSearchVisible(false);
  };

  return (
    <div
      className={styles.page__main}
      onClick={handleCloseDropdownSearch}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMoveRecipe}
    >
      <div className={styles.container__cooking}>
        <div
          style={{
            position: "absolute",
            top: "0",
            left: `calc(${recipeWidth} - 1.5%)`,
            width: "2%",
            height: "100%",
            cursor: "ew-resize",
            zIndex: "5",
          }}
          onMouseDown={handleMouseDownX}
        ></div>
        <DropdownMenu
          isDropdownVisible={isDropdownVisible}
          onClickDropdown={handleToggleDropdown}
        />

        <section
          style={{
            position: "relative",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: recipeWidth,
            height: "100%",
            overflowY: "scroll",
            scrollbarColor: "rgb(255, 255, 232) rgb(253, 231, 157)",
          }}
        >
          <Search
            isSearchVisible={isSearchVisible}
            searchRef={searchRef}
            onClickSearch={handleToggleSearch}
          />
          <Recipe recipeWidth={recipeWidth} />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateRows: `${timerHeight} calc(100% - ${timerHeight})`,
            width: `calc(100% - ${recipeWidth})`,
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `calc(${timerHeight} - 2%)`,
              right: "0",
              width: `calc(100% - ${recipeWidth})`,
              height: "2%",
              cursor: "ns-resize",
              zIndex: "5",
            }}
            onMouseDown={handleMouseDownY}
          ></div>
          <Timers />
          <Note />
        </section>
      </div>
    </div>
  );
}

function Search({
  isSearchVisible,
  searchRef,
  onClickSearch,
}: {
  isSearchVisible: boolean;
  searchRef: any;
  onClickSearch: () => void;
}) {
  const RECIPES_PER_PAGE = 6;
  const userContext = useContext(AccessTokenContext);
  const [numberOfUserRecipes, setNumberOfUserRecipes] = useState(0);
  const [recipes, setRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [curPageRecipes, setCurPageRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [numberOfPages, setNumberOfPages] = useState<number>(0);
  const [curPage, setCurPage] = useState<number>(1);

  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [input, setInput] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const userRecipes = await getRecipes();
      setNumberOfUserRecipes(userRecipes?.length || 0);
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
    setCurPageRecipes(recipesPerPage);
  }, [curPage]);

  useEffect(() => {
    const message = createMessage(
      error,
      isPending,
      numberOfUserRecipes,
      curPageRecipes.length
    ) as string;
    setMessage(message);
  }, [error, isPending, numberOfUserRecipes, curPageRecipes.length]);

  async function getRecipes(keyword: string = "") {
    try {
      setIsPending(true);

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
      setCurPageRecipes(getRecipesPerPage(orderedRecipes, RECIPES_PER_PAGE, 1));
      setNumberOfPages(calcNumberOfPages(orderedRecipes, RECIPES_PER_PAGE));
      data.newAccessToken && userContext?.login(data.newAccessToken);

      setIsPending(false);
      return orderedRecipes;
    } catch (err: any) {
      setIsPending(false);
      setError(`Server error while getting recipes 🙇‍♂️ ${err.message}`);
      console.error("Error while getting recipes", err.message);
    }
  }

  const handleChangeInput = function (e: React.ChangeEvent<HTMLInputElement>) {
    if (timeoutId) clearTimeout(timeoutId);

    const keyword = e.currentTarget.value.trim().toLowerCase();

    const id = setTimeout(async () => {
      if (!keyword) return;
      setInput(keyword);
      setCurPage(1);

      await getRecipes(keyword);
    }, 600);

    setTimeoutId(id);
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  //I'm gonna make it work for arrow keydown event later too!
  function handlePagination(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;

    target.value === "decrease"
      ? setCurPage((prev) => prev - 1)
      : setCurPage((prev) => prev + 1);
  }

  function handleClickPreview(recipe: any) {
    window.location.hash = recipe._id;
  }

  return (
    <div
      className={styles.container__search_menu}
      style={{
        transform: !isSearchVisible ? "translateX(-100%)" : "translateX(0%)",
      }}
    >
      <button
        className={styles.btn__search_menu}
        type="button"
        onClick={onClickSearch}
      ></button>
      <div className={styles.search_menu} ref={searchRef}>
        <form className={styles.container__search} onSubmit={handleSubmit}>
          <input
            id={styles.input__search}
            type="search"
            placeholder="Search your recipe"
            onChange={handleChangeInput}
          ></input>
          <button className={styles.btn__search} type="submit">
            Search
          </button>
        </form>
        <ul className={styles.search_results}>
          {message ? (
            <p className={styles.no_results}>{message}</p>
          ) : (
            curPageRecipes.map((recipe, i) => (
              <li
                key={i}
                className={styles.recipe_preview}
                onClick={() => handleClickPreview(recipe)}
              >
                {recipe.mainImage?.data ? (
                  <Image
                    className={styles.img__main}
                    src={recipe.mainImage.data}
                    alt="main image"
                    width={50}
                    height={50}
                  ></Image>
                ) : (
                  <div
                    style={{
                      backgroundColor: "grey",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
                <p className={styles.title}>{recipe.title}</p>
                {recipe.favorite && (
                  <Image
                    className={styles.img__favorite}
                    src="/star-on.png"
                    alt="favorite icon"
                    width={18}
                    height={18}
                  ></Image>
                )}
              </li>
            ))
          )}
        </ul>
        {curPage > 1 && (
          <button
            className={clsx(
              styles.btn__pagination,
              styles.btn__pagination_left
            )}
            type="button"
            value="decrease"
            onClick={handlePagination}
          >
            Page {curPage - 1}
            <br />
            &larr;
          </button>
        )}
        {curPage < numberOfPages && (
          <button
            className={clsx(
              styles.btn__pagination,
              styles.btn__pagination_right
            )}
            type="button"
            value="increase"
            onClick={handlePagination}
          >
            Page {curPage + 1}
            <br />
            &rarr;{" "}
          </button>
        )}
      </div>
    </div>
  );
}

//prettier ignore
function Recipe({ recipeWidth }: { recipeWidth: string }) {
  const userContext = useContext(AccessTokenContext);
  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE>();
  //use curRecipe to modify the recipe value
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
  const [favorite, setFavorite] = useState<boolean>();
  const [servingsValue, setServingsValue] = useState<number>();
  const [ingredientsUnit, setIngredientsUnit] = useState<
    "original" | "metric" | "us" | "japan" | "australia" | "metricCup"
  >("original");
  // const [mainImage, setMainImage] = useState<TYPE_FILE | undefined>();
  // const [instructionImages, setInstructionImages] = useState<
  //   (TYPE_FILE | undefined)[]
  // >([undefined]);
  // const [memoryImages, setMemoryImages] = useState<TYPE_FILE[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id)
      return setMessage("Let's start cooking by selecting your recipe :)");
    (async () => await getRecipe(id))();
  }, [window.location.hash]);

  async function getRecipe(id: string) {
    try {
      setIsLoading(true);
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      //recipe is stored inside _doc of data.data
      //images are stored in data.data
      const recipe = { ...data.data._doc };
      recipe.mainImage = data.data.mainImage;
      recipe.instructions = data.data.instructions;
      recipe.memoryImages = data.data.memoryImages;

      console.log(recipe);
      setStateInitNoImages(recipe);
      // setMainImage(data.data.mainImage);
      // setInstructionImages(
      //   data.data.instructions.map(
      //     (inst: { instruction: string; image: TYPE_FILE | undefined }) =>
      //       inst.image
      //   )
      // );
      // setMemoryImages(data.data.memoryImages);

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

  function setStateInitNoImages(recipe: TYPE_RECIPE) {
    setRecipe(recipe);
    setCurRecipe(recipe);
    setFavorite(recipe.favorite);
    setServingsValue(recipe.servings.servings);
    setIngredientsUnit(recipe.region);
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
    const value = e.currentTarget.value;
    if (
      value !== "metric" &&
      value !== "us" &&
      value !== "japan" &&
      value !== "australia" &&
      value !== "metricCup"
    )
      return;

    setIngredientsUnit(value);
  }

  async function handleClickFavorite() {
    setFavorite(!favorite);

    if (!recipe) return;

    const newRecipe = { ...recipe };
    newRecipe.favorite = !favorite;
    // newRecipe.mainImage = mainImage;
    // newRecipe.instructions = recipe.instructions.map((inst, i) => {
    //   return {
    //     instruction: inst.instruction,
    //     image: instructionImages[i],
    //   };
    // });
    // newRecipe.memoryImages = memoryImages;

    uploadRecipe(newRecipe, userContext);
  }

  return (
    <>
      {error && (
        <p
          style={{
            backgroundColor: error ? "orangered" : "rgba(112, 231, 0, 1)",
            color: "white",
            padding: "0.7% 1%",
            borderRadius: "5px",
            fontSize: "1.4vw",
            letterSpacing: "0.07vw",
            marginBottom: "1%",
          }}
        >
          {error}
        </p>
      )}
      {isLoading ||
      !recipe ||
      !curRecipe ||
      (!servingsValue && servingsValue !== 0) ||
      favorite === undefined ? (
        <MessageContainer
          message={isLoading ? "Loading your recipe..." : message}
          fontSize={"1.6vw"}
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
            width: "100%",
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "3% 0",
            color: "rgb(60, 0, 116)",
          }}
        >
          <ImageTitle
            recipeWidth={recipeWidth}
            image={recipe.mainImage}
            title={recipe.title}
          />
          <BriefExplanation
            recipeWidth={recipeWidth}
            curRecipe={curRecipe}
            servingsValue={servingsValue}
            favorite={favorite}
            ingredientsUnit={ingredientsUnit}
            onChangeServings={handleChangeServings}
            onChangeIngredientsUnit={handleChangeIngredientsUnit}
            onClickFavorite={handleClickFavorite}
          />
          <Ingredients
            recipeWidth={recipeWidth}
            servingsValue={servingsValue}
            ingredients={curRecipe.ingredients}
            ingredientsUnit={ingredientsUnit}
          />
          <Instructions
            recipeWidth={recipeWidth}
            instructions={recipe.instructions}
          />
          <AboutThisRecipe description={recipe.description} />
          <Memories recipeWidth={recipeWidth} images={recipe.memoryImages} />
          <Comments comments={recipe.comments} />

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

function ImageTitle({
  image,
  title,
  recipeWidth,
}: {
  image: TYPE_FILE | undefined;
  title: string;
  recipeWidth: string;
}) {
  const [width, setWidth] = useState(440);
  const [height, setHeight] = useState(290);

  useEffect(() => {
    setWidthHeight();
  }, [recipeWidth]);

  function setWidthHeight() {
    const width = recipeWidth.includes("px")
      ? parseInt(recipeWidth) * 0.7
      : 440;
    const height = width * 0.66;

    setWidth(width);
    setHeight(height);
  }

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
          style={{ width: `${width}px`, height: `${height}px` }}
        ></div>
      ) : (
        <Image
          src={image.data}
          alt="main image"
          width={width}
          height={height}
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
          padding: "1% 3.5%",
          transform: "skewX(-17deg)",
          zIndex: "2",
        }}
      >
        <p
          style={{
            width: "100%",
            height: "100%",
            fontSize: `${width / 15}px`,
            letterSpacing: "0.1vw",
            textAlign: "center",
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

function BriefExplanation({
  recipeWidth,
  curRecipe,
  servingsValue,
  ingredientsUnit,
  favorite,
  onChangeServings,
  onChangeIngredientsUnit,
  onClickFavorite,
}: {
  recipeWidth: string;
  curRecipe: TYPE_RECIPE;
  servingsValue: number;
  ingredientsUnit: string;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIngredientsUnit: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickFavorite: () => void;
}) {
  const [width, setWidth] = useState<string>("90%");
  const [iconSize, setIconSize] = useState<string>("20");
  const [fontFukidashiSize, setFontFukidashiSize] = useState<string>("1.2vw");
  const [fontOtherSize, setFontOtherSize] = useState<string>("1.2vw");

  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [author, setAuthour] = useState(curRecipe.author);
  const [servingsUnit, setServingsUnit] = useState(curRecipe.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe.servings.customUnit
  );
  const [temperaturs, setTemperatures] = useState(
    curRecipe.temperatures.temperatures.join(" / ")
  );
  const [temperatureUnit, setTemperatureUnit] = useState<"℉" | "℃">(
    curRecipe.temperatures.unit
  );

  useEffect(() => {
    setWidth(getSize(recipeWidth, 0.9, "90%"));
    setIconSize(getSize(recipeWidth, 0.02, "20"));
    setFontFukidashiSize(getSize(recipeWidth, 0.02, "1.2vw"));
    setFontOtherSize(getSize(recipeWidth, 0.025, "1.2vw"));
  }, [recipeWidth]);

  function getSize(recipeWidth: string, ratio: number, defaultRatio: string) {
    return recipeWidth.includes("px")
      ? `${parseInt(recipeWidth) * ratio}px`
      : defaultRatio;
  }

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    i: number
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
        width: width,
        aspectRatio: "1/0.1",
        gap: "3%",
        margin: recipeWidth.includes("px")
          ? `${parseInt(recipeWidth) * 0.07}px 0 ${
              parseInt(recipeWidth) * 0.07
            }px 0`
          : "50px 0 28px 0",
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
          borderRadius: "1% / 7%",
          gap: "20%",
          boxShadow: "rgba(0, 0, 0, 0.27) 3px 3px 5px",
        }}
      >
        <div className={styles.container__author_servings}>
          <div
            className={styles.icons__brief_explanation}
            data-icon="0"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: "fit-content",
                height: "fit-content",
                top: "-230%",
                left: "-280%",
                opacity: !mouseOver[0] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ fontSize: fontFukidashiSize }}
              >
                Author of the recipe
              </p>
            </div>
            <Image
              src={"/person.svg"}
              alt="person icon"
              width={parseInt(iconSize)}
              height={parseInt(iconSize)}
            ></Image>
          </div>
          <span style={{ width: "19%", fontSize: fontOtherSize }}>
            {author}
          </span>
          <div
            className={styles.icons__brief_explanation}
            data-icon="1"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: "fit-content",
                height: "fit-content",
                top: "-280%",
                left: "-380%",
                opacity: !mouseOver[1] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ fontSize: fontFukidashiSize }}
              >
                Number of servings of the recipe
              </p>
            </div>
            <Image
              src={"/servings.svg"}
              alt="servings icon"
              width={parseInt(iconSize)}
              height={parseInt(iconSize)}
            ></Image>
          </div>
          <input
            className={styles.input__brief_explanation}
            style={{ width: "17%", fontSize: fontOtherSize }}
            type="number"
            min="1"
            max={MAX_SERVINGS}
            name="servings"
            placeholder="Servings"
            value={servingsValue}
            onChange={onChangeServings}
          />
          <span style={{ width: "20%", fontSize: fontOtherSize }}>
            {servingsUnit !== "other" ? servingsUnit : servingsCustomUnit}
          </span>
        </div>
        <div className={styles.container__units}>
          <div
            className={styles.icons__brief_explanation}
            data-icon="2"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: "fit-content",
                height: "fit-content",
                top: "-260%",
                left: "-300%",
                opacity: !mouseOver[2] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ fontSize: fontFukidashiSize }}
              >
                Unit system you prefer
              </p>
            </div>
            <Image
              src={"/scale.svg"}
              alt="ingredient units icon"
              width={parseInt(iconSize)}
              height={parseInt(iconSize)}
            ></Image>
          </div>
          <select
            className={styles.input__brief_explanation}
            style={{ width: "25%", fontSize: fontOtherSize }}
            name="region"
            value={ingredientsUnit}
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
            className={styles.icons__brief_explanation}
            data-icon="3"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: "fit-content",
                height: "fit-content",
                top: "-300%",
                left: "-370%",
                opacity: !mouseOver[3] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ fontSize: fontFukidashiSize }}
              >
                Temperatures used in the recipe
              </p>
            </div>
            <Image
              src={"/temperature.svg"}
              alt="ingredient units icon"
              width={parseInt(iconSize)}
              height={parseInt(iconSize)}
            ></Image>
          </div>
          <span style={{ fontSize: fontOtherSize }}>{temperaturs}</span>
          <select
            className={styles.input__brief_explanation}
            style={{ width: "8%", fontSize: fontOtherSize }}
            name="temperatureUnit"
            value={temperatureUnit}
            onChange={(e) => handleChangeInput(e, 0)}
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
          width: "4.5%",
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

function Ingredients({
  servingsValue,
  ingredients,
  ingredientsUnit,
}: {
  servingsValue: number;
  ingredients: TYPE_INGREDIENTS;
  ingredientsUnit:
    | "original"
    | "metric"
    | "us"
    | "japan"
    | "australia"
    | "metricCup";
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "90%",
        height: "fit-content",
        backgroundColor: "rgb(255, 247, 177)",
        padding: "2%",
        borderRadius: "3px",
        overflowX: "auto",
      }}
    >
      <h2 className={styles.header}>Ingredients</h2>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          justifyItems: "left",
          marginTop: "2%",
          fontSize: "1.3vw",
          wordSpacing: "0.1vw",
          columnGap: "5%",
          rowGap: "0px",
          paddingLeft: "0",
        }}
      >
        {ingredients.map((ing, i) => (
          <IngLine
            key={i}
            servingsValue={servingsValue}
            ingredient={ing}
            ingredientsUnit={ingredientsUnit}
          />
        ))}
      </div>
    </div>
  );
}

function IngLine({
  servingsValue,
  ingredient,
  ingredientsUnit,
}: {
  servingsValue: number;
  ingredient: TYPE_INGREDIENT;
  ingredientsUnit:
    | "original"
    | "metric"
    | "us"
    | "japan"
    | "australia"
    | "metricCup";
}) {
  const [newIngredient, setNewIngredient] = useState<{
    amount: number;
    unit: string;
  }>({
    amount: ingredient.amount,
    unit: getReadableIngUnit(ingredient.unit, ingredient.customUnit),
  });

  useEffect(() => {
    //Not applicable converted ingredients unit => ingrediet otherwise converted ingredient
    const newIngredient =
      ingredientsUnit === "original" ||
      !ingredient?.convertion ||
      !ingredient.convertion[ingredientsUnit]
        ? {
            amount: ingredient.amount,
            unit: getReadableIngUnit(ingredient.unit, ingredient.customUnit),
          }
        : ingredient.convertion[ingredientsUnit];

    setNewIngredient(newIngredient);
  }, [ingredient, servingsValue, ingredientsUnit]);

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "4%",
        whiteSpace: "nowrap",
      }}
    >
      <input
        style={{ width: "1.3vw", marginLeft: "2%" }}
        type="checkbox"
      ></input>
      {newIngredient.amount !== 0 && (
        <span>
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
      {newIngredient.unit && <span>{`${newIngredient.unit} of`}</span>}
      <span>{ingredient.ingredient}</span>
    </div>
  );
}

function Instructions({
  instructions,
}: {
  instructions: { instruction: string; image: TYPE_FILE | undefined }[];
}) {
  return (
    <div
      style={{
        position: "relative",
        top: "30px",
        width: "80%",
        height: "fit-content",
      }}
    >
      <h2 className={styles.header} style={{ marginBottom: "20px" }}>
        Instructions
      </h2>
      {instructions.map((inst, i) => (
        <Instruction key={i} instruction={inst} i={i} />
      ))}
    </div>
  );
}

function Instruction({
  instruction,
  i,
}: {
  instruction: { instruction: string; image: TYPE_FILE | undefined };
  i: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        textAlign: "left",
        alignItems: "center",
        gap: "5%",
        width: "100%",
        height: "fit-content",
        backgroundColor: "rgba(255, 255, 236, 0.91)",
        padding: "4% 3%",
        fontSize: "1.2vw",
        letterSpacing: "0.05vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          width: "25px",
          aspectRatio: "1",
          fontSize: "1.4vw",
          borderRadius: "50%",
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
          fontSize: "1.2vw",
          letterSpacing: "0.03vw",
          padding: instruction.image?.data ? "0 1%" : "0 0 0 3%",
        }}
      >
        {instruction.instruction}
      </p>
      <div
        style={{
          position: "relative",
          width: instruction.image?.data ? "140px" : "0",
          height: "100px",
        }}
      >
        {instruction.image?.data && (
          <Image
            src={instruction.image.data}
            alt={`instruction ${i + 1} image`}
            width={140}
            height={100}
          ></Image>
        )}
      </div>
    </div>
  );
}

function AboutThisRecipe({ description }: { description: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        width: "100%",
        maxHeight: "30%",
        marginTop: "70px",
      }}
    >
      <h2 className={styles.header}>About this recipe</h2>
      <div
        style={{
          backgroundColor: description ? "rgb(255, 247, 133)" : "transparent",
          width: "85%",
          height: "130px",
          fontSize: "1.2vw",
          letterSpacing: "0.05vw",
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
            fontSize: "1.3vw",
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

function Memories({ images }: { images: [] | TYPE_FILE[] }) {
  const [curImage, setCurImage] = useState(0);

  function handleClickDot(i: number) {
    setCurImage(i);
  }

  return (
    <div
      style={{
        marginTop: "40px",
        width: "60%",
        height: images.length ? "250px" : "150px",
      }}
    >
      <h2 className={styles.header}>Memories of the recipe</h2>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "80%",
          overflow: "hidden",
        }}
      >
        {images.map((img, i) => (
          <MemoryImg
            key={i}
            i={i}
            image={img}
            translateX={calcTransitionXSlider(i, curImage)}
          />
        ))}
        {images.length ? (
          <div
            style={{
              position: "absolute",
              width: "70%",
              height: "5%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.7%",
              bottom: "5%",
            }}
          >
            {/* add one for upload slide for edit */}
            {images.map((_, i) => (
              <button
                key={i}
                style={{
                  opacity: "0.6",
                  width: "2.5%",
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
          <p className={styles.no_content}>There're no memory images</p>
        )}
      </div>
    </div>
  );
}

function MemoryImg({
  i,
  image,
  translateX,
}: {
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
          width={400}
          height={200}
        ></Image>
      )}
    </div>
  );
}

function Comments({ comments }: { comments: string }) {
  return (
    <div
      style={{
        marginTop: "30px",
        width: "70%",
        height: comments ? "200px" : "150px",
      }}
    >
      <h2 className={styles.header}> Comments</h2>
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
            fontSize: comments ? "1.3vw" : "1.4vw",
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

function Timer({
  index,
  audioRef,
  onClickDelete,
}: {
  index: number;
  audioRef: any;
  onClickDelete: (i: number) => void;
}) {
  const defaultTime = { hours: "", minutes: "", seconds: "" };
  const [title, setTitle] = useState(`Timer ${index + 1}`);
  const [time, setTime] = useState(defaultTime);
  const [paused, setPaused] = useState(false);
  const [reseted, setReseted] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  let immediateTime = time; //For immediate update

  const changeTime = (newTime: {
    hours: string;
    minutes: string;
    seconds: string;
  }) => {
    setTime(newTime);
    immediateTime = newTime;
  };

  const handleKeyDown = function (e: React.KeyboardEvent) {
    e.preventDefault();
  };

  //save change after 0.3 sec
  const handleChangeTitle = function (e: React.ChangeEvent<HTMLInputElement>) {
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => setTitle(e.target.value), 500);

    setTimeoutId(newTimeoutId);
  };

  const startTimer = () => {
    if (
      !immediateTime.hours &&
      !immediateTime.minutes &&
      !immediateTime.seconds
    )
      return;

    const id = setInterval(() => {
      const numberHours = parseInt(immediateTime.hours);
      const numberMinutes = parseInt(immediateTime.minutes);
      const numberSeconds = parseInt(immediateTime.seconds);
      if (!numberHours && !numberMinutes && !numberSeconds) {
        audioRef.current.play();
        clearInterval(id);
        return;
      }
      const nextSeconds = !numberSeconds
        ? "59"
        : (numberSeconds - 1).toString().padStart(2, "0");

      let nextMinutes: string = "0";
      if (nextSeconds === "59") {
        if (!numberMinutes) nextMinutes = "59";
        if (numberMinutes)
          nextMinutes = (numberMinutes - 1).toString().padStart(2, "0");
      } else {
        nextMinutes = immediateTime.minutes;
      }

      let nextHours: string = "0";
      if (nextSeconds === "59" && nextMinutes === "59") {
        if (!numberHours) nextHours = "00";
        if (numberHours)
          nextHours = (numberHours - 1).toString().padStart(2, "0");
      } else {
        nextHours = immediateTime.hours;
      }

      const nextTime = {
        hours: nextHours,
        minutes: nextMinutes,
        seconds: nextSeconds,
      };

      //assign to times for immediate update
      changeTime(nextTime);
    }, 1000);

    setIntervalId(id);
  };

  const handleStart = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "stop") return;

    const MAX_HOURS = 23;
    const MAX_MINUTES = 59;
    const MAX_SECONDS = 59;

    const convertTime = (hours: number, minutes: number, seconds: number) => {
      if (hours > MAX_HOURS) return null;

      // all fields within the allowed range
      if (minutes <= MAX_MINUTES && seconds <= MAX_SECONDS)
        return {
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        };

      // minutes, seconds, or both are not within the allowd range => convert
      const newSeconds = seconds % 60;
      const min = +parseInt(seconds / 60 + "") + minutes;
      const newMinutes = min % 60;
      const newHours = +parseInt(min / 60 + "") + hours;

      if (newHours > MAX_HOURS) return null;

      return {
        hours: newHours.toString().padStart(2, "0"),
        minutes: newMinutes.toString().padStart(2, "0"),
        seconds: newSeconds.toString().padStart(2, "0"),
      };
    };

    const validateTime = (hours: number, minutes: number, seconds: number) => {
      //if no input => false
      if (!hours && !minutes && !seconds) return false;

      //if input is lower than 0 => false
      if (
        (hours && hours < 0) ||
        (minutes && minutes < 0) ||
        (seconds && seconds < 0)
      )
        return false;

      if (!convertTime(hours, minutes, seconds)) return false;

      return true;
    };

    const form = e.currentTarget.closest("form");
    if (!form) return console.error("No form!");

    const inputHours =
      +(form.querySelector('input[name="hours"]') as HTMLInputElement).value ||
      0;
    const inputMinutes =
      +(form.querySelector('input[name="minutes"]') as HTMLInputElement)
        .value || 0;
    const inputSeconds =
      +(form.querySelector('input[name="seconds"]') as HTMLInputElement)
        .value || 0;

    if (!validateTime(inputHours, inputMinutes, inputSeconds)) return;

    const newTime = convertTime(inputHours, inputMinutes, inputSeconds);
    if (!newTime) return;

    changeTime(newTime);

    startTimer();
  };

  const handleStop = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "start") return;

    if (
      parseInt(time.hours) ||
      parseInt(time.minutes) ||
      parseInt(time.seconds)
    ) {
      setPaused(true);
      intervalId && clearInterval(intervalId);
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    changeTime(defaultTime);
  };

  const togglePaused = () => {
    setPaused(!paused);
  };

  const handlePause = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "start") return;

    if (time.hours === "" && time.minutes === "" && time.seconds === "") return;

    togglePaused();
    intervalId && clearInterval(intervalId);
  };

  const handleRestart = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "pause") return;

    togglePaused();
    startTimer();
  };

  const handleReset = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (time.hours === "" && time.minutes === "" && time.seconds === "") return;

    const value = e.currentTarget.value;

    setReseted(value === "reset" ? true : false);

    if (value === "delete") setTime(defaultTime);
  };

  const isTimerSet = () =>
    !time.hours && !time.minutes && !time.seconds ? false : true;
  return (
    <form className={styles.timer} data-timer={index}>
      <button
        className={clsx(styles.btn__x, styles.btn__x_timer)}
        type="button"
        onClick={(e) => {
          onClickDelete(index);
          handleStop(e);
        }}
      >
        &times;
      </button>
      <input
        className={styles.input__timer_title}
        type="text"
        placeholder="Set title for timer"
        defaultValue={title}
        onKeyDown={handleKeyDown}
        onChange={handleChangeTitle}
      />
      <div className={styles.container__input_time}>
        {!isTimerSet() || reseted ? (
          <>
            <input
              className={clsx(styles.input__time, styles.input__timer_hours)}
              name="hours"
              type="number"
              placeholder="h"
              min="0"
              max="23"
              defaultValue={time.hours}
            />
            <input
              className={clsx(styles.input__time, styles.input__timer_minutes)}
              name="minutes"
              type="number"
              placeholder="min"
              min="0"
              max="59"
              defaultValue={time.minutes}
            />
            <input
              className={clsx(styles.input__time, styles.input__timer_seconds)}
              name="seconds"
              type="number"
              placeholder="sec"
              min="0"
              max="59"
              defaultValue={time.seconds}
            />
          </>
        ) : (
          <>
            <span>
              {time.hours} : {time.minutes} : {time.seconds}
            </span>
          </>
        )}
      </div>
      <div className={styles.container__btns}>
        <button
          className={styles.btn__start}
          type="button"
          onClick={(e) => {
            handleStart(e), handleStop(e);
          }}
          value={!isTimerSet() ? "start" : "stop"}
        >
          {!isTimerSet() ? "Start" : "Stop"}
        </button>
        <button
          className={styles.btn__pause}
          type="button"
          onClick={(e) => {
            handlePause(e);
            handleRestart(e);
          }}
          value={!paused ? "pause" : "start"}
        >
          {!paused ? "Pause" : "Start"}
        </button>
        <button
          className={styles.btn__reset}
          type="reset"
          onClick={handleReset}
          value={!reseted ? "reset" : "delete"}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

/////There is a bug when delete timer with fewer number they can not be deleted! Because I can't update index after spliced markupTimersArr I assume
function Timers() {
  const MAX_TIMERS = 10;
  const audioRef = useRef(null);
  const [numberOfTimers, setNumberOfTimers] = useState<number>(1);
  const [deletedIndex, setDeletedIndex] = useState<number | null>(null);

  const handleDeleteTimers = function (i: number) {
    if (!numberOfTimers) return;
    setNumberOfTimers((prev) => (!prev ? prev : prev - 1));
    setDeletedIndex(i);
  };

  const handleAddTimers = function () {
    if (numberOfTimers === MAX_TIMERS) return;
    setNumberOfTimers((prev) => prev + 1);
  };

  const markupTimer = (i: number) => (
    <Timer
      key={nanoid()}
      index={i}
      audioRef={audioRef}
      onClickDelete={handleDeleteTimers}
    />
  );

  // const updatedIndex = markupTimersArr.findIndex(markup=> markup === markupPrev)

  const [markupTimersArr, setMarkupTimersArr] = useState(
    numberOfTimers
      ? new Array(numberOfTimers).fill("").map((_, i) => markupTimer(i))
      : []
  );

  ////update when numberOfTimers changes
  useEffect(() => {
    //when timer is added
    if (markupTimersArr.length < numberOfTimers)
      setMarkupTimersArr((prev) => [...prev, markupTimer(numberOfTimers - 1)]);

    //when timer is deleted
    if (markupTimersArr.length > numberOfTimers)
      setMarkupTimersArr((prev) => {
        if (!deletedIndex && deletedIndex !== 0) return [...prev];

        return [...prev].toSpliced(deletedIndex, 1);
      });
  }, [numberOfTimers]);

  return (
    <section className={styles.section__timers}>
      <h2>Timers</h2>
      <div className={styles.container__timers}>
        <audio ref={audioRef} src="/timerAlerm.mp3"></audio>
        {markupTimersArr}
        {numberOfTimers === MAX_TIMERS || (
          <div className={styles.container__btn_add}>
            <button className={styles.btn__add} onClick={handleAddTimers}>
              +<br />
              Add
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Note() {
  return (
    <section className={styles.section__note} contentEditable="true">
      You can use this space for taking a note for cooking :)
    </section>
  );
}
