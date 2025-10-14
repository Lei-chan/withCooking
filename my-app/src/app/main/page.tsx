"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState, useContext } from "react";
import { nanoid } from "nanoid";
import fracty from "fracty";
import { MediaContext, UserContext } from "../lib/providers";
import {
  getData,
  getSize,
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
  getNextSlideIndex,
} from "@/app/lib/helper";
import {
  MAX_SERVINGS,
  TYPE_RECIPE,
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  SLIDE_TRANSITION_SEC,
  TYPE_USER_CONTEXT,
  TYPE_MEDIA,
} from "../lib/config";
import { MessageContainer, OverlayMessage } from "../lib/components/components";

export default function MAIN() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);

  const searchRef = useRef(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const [recipeWidth, setRecipeWidth] = useState(
    mediaContext === "mobile"
      ? window.innerWidth + "px"
      : mediaContext === "tablet"
      ? window.innerWidth * 0.75 + "px"
      : window.innerWidth * 0.5 + "px"
  );
  const [timerHeight, setTimerHeight] = useState(
    window.innerHeight * 0.65 + "px"
  );
  const timerNoteWidth =
    mediaContext === "mobile"
      ? window.innerWidth + "px"
      : window.innerWidth - parseFloat(recipeWidth) + "px";

  function handleMouseDownX() {
    setIsDraggingX(true);
  }

  function handleMouseDownY() {
    if (mediaContext === "mobile") return;
    setIsDraggingY(true);
  }

  function handleMouseUp() {
    setIsDraggingX(false);
    mediaContext !== "mobile" && setIsDraggingY(false);
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

  function handleToggleLogout() {
    setIsMessageVisible(!isMessageVisible);
  }

  console.log(mediaContext);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onClick={handleCloseDropdownSearch}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMoveRecipe}
    >
      {userContext?.isMessageVisible && (
        <OverlayMessage option="message" content="welcome" />
      )}
      {isMessageVisible && (
        <OverlayMessage
          option="question"
          content="logout"
          toggleLogout={handleToggleLogout}
        />
      )}
      <div
        style={
          mediaContext === "mobile"
            ? { width: "100%", height: "100%" }
            : {
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100%",
              }
        }
      >
        <Search
          mediaContext={mediaContext}
          userContext={userContext}
          isSearchVisible={isSearchVisible}
          searchRef={searchRef}
          onClickSearch={handleToggleSearch}
        />
        {mediaContext !== "mobile" && (
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
        )}
        <DropdownMenu
          mediaContext={mediaContext}
          isDropdownVisible={isDropdownVisible}
          onClickDropdown={handleToggleDropdown}
          onClickLogout={handleToggleLogout}
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
          <Recipe
            mediaContext={mediaContext}
            userContext={userContext}
            recipeWidth={recipeWidth}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateRows: `${timerHeight} calc(100% - ${timerHeight})`,
            width:
              mediaContext === "mobile"
                ? "100%"
                : `calc(100% - ${recipeWidth})`,
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
          <Timers mediaContext={mediaContext} timerWidth={timerNoteWidth} />
          <Note mediaContext={mediaContext} noteWidth={timerNoteWidth} />
        </section>
      </div>
    </div>
  );
}

function Search({
  mediaContext,
  userContext,
  isSearchVisible,
  searchRef,
  onClickSearch,
}: {
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  isSearchVisible: boolean;
  searchRef: any;
  onClickSearch: () => void;
}) {
  const RECIPES_PER_PAGE = 6;
  const searchMenuSize =
    window.innerWidth * (mediaContext === "mobile" ? 0.7 : 0.25) + "px";
  const fontSize =
    parseFloat(searchMenuSize) * (mediaContext === "mobile" ? 0.07 : 0.05) +
    "px";
  const mainImageSize =
    parseFloat(searchMenuSize) * (mediaContext === "mobile" ? 0.25 : 0.2) +
    "px";

  const [numberOfUserRecipes, setNumberOfUserRecipes] = useState(0);
  const [recipes, setRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [curPageRecipes, setCurPageRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [numberOfPages, setNumberOfPages] = useState<number>(0);
  const [curPage, setCurPage] = useState<number>(1);

  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: searchMenuSize,
        height: "100%",
        zIndex: "10",
        transition: "all 0.3s",
        transform: !isSearchVisible ? "translateX(-100%)" : "translateX(0%)",
        fontSize: fontSize,
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
            style={{ fontSize: `calc(${fontSize} * 0.9)` }}
            type="search"
            placeholder="Search your recipe"
            onChange={handleChangeInput}
          ></input>
          <button
            className={styles.btn__search}
            style={{ fontSize: `calc(${fontSize} * 0.7)` }}
            type="submit"
          >
            Search
          </button>
        </form>
        <ul className={styles.search_results}>
          {message ? (
            <p className={styles.no_results} style={{ fontSize: fontSize }}>
              {message}
            </p>
          ) : (
            curPageRecipes.map((recipe, i) => (
              <li
                key={i}
                className={styles.recipe_preview}
                onClick={() => handleClickPreview(recipe)}
              >
                {recipe.mainImage?.data ? (
                  <Image
                    style={{ borderRadius: "50%" }}
                    src={recipe.mainImage.data}
                    alt="main image"
                    width={parseFloat(mainImageSize)}
                    height={parseFloat(mainImageSize)}
                  ></Image>
                ) : (
                  <div
                    style={{
                      backgroundColor: "grey",
                      width: mainImageSize,
                      height: mainImageSize,
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
                <p className={styles.title}>{recipe.title}</p>
                {recipe.favorite && (
                  <Image
                    src="/star-on.png"
                    alt="favorite icon"
                    width={parseFloat(mainImageSize) * 0.3}
                    height={parseFloat(mainImageSize) * 0.3}
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

function DropdownMenu({
  mediaContext,
  isDropdownVisible,
  onClickDropdown,
  onClickLogout,
}: {
  mediaContext: TYPE_MEDIA;
  isDropdownVisible: boolean;
  onClickDropdown: () => void;
  onClickLogout: () => void;
}) {
  const fontSize = mediaContext === "mobile" ? "4vw" : "2vw";
  return (
    <div
      style={{
        position: "absolute",
        top: mediaContext === "mobile" ? "0%" : "1%",
        right: "3%",
        aspectRatio: "1 / 1.8",
        zIndex: "10",
        width: mediaContext === "mobile" ? "60%" : "20%",
        pointerEvents: !isDropdownVisible ? "none" : "all",
      }}
    >
      <button
        style={{
          pointerEvents: "all",
          width: mediaContext === "mobile" ? "16%" : "22%",
          aspectRatio: "1",
          background: "none",
          border: "none",
          backgroundImage: 'url("/dropdown.svg")',
          backgroundRepeat: "no-repeat",
          backgroundSize: "65%",
          backgroundPosition: "center",
          marginLeft: "90%",
        }}
        type="button"
        onClick={onClickDropdown}
      ></button>
      <ul
        style={{
          width: "100%",
          height: "100%",
          listStyleType: "none",
          textAlign: "center",
          borderRadius: "1.8% / 1%",
          boxShadow: "rgba(0, 0, 0, 0.315) 4px 4px 10px",
          overflow: "hidden",
          transition: "all 0.4s",
          fontSize: fontSize,
          opacity: !isDropdownVisible ? 0 : 1,
        }}
      >
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/recipes"
        >
          <li className={styles.list}>
            <Image
              src={"/recipes.svg"}
              alt="recipe icon"
              width={25}
              height={25}
            ></Image>
            <span>Recipes</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/converter"
        >
          <li className={styles.list}>
            <Image
              src={"/convert.svg"}
              alt="converter icon"
              width={25}
              height={25}
            ></Image>
            <span>Converter</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/account"
        >
          <li className={styles.list}>
            <Image
              src={"/account.svg"}
              alt="account icon"
              width={25}
              height={25}
            ></Image>
            <span>Account</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/news"
        >
          <li className={styles.list}>
            <Image
              src={"/news.svg"}
              alt="news icon"
              width={25}
              height={25}
            ></Image>
            <span>News</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/how-to-use"
        >
          <li className={styles.list}>
            <Image
              src={"/howtouse.svg"}
              alt="how to use icon"
              width={25}
              height={25}
            ></Image>
            <span>How to use</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/feedback"
        >
          <li className={styles.list}>
            <Image
              src={"/feedback.svg"}
              alt="feedback icon"
              width={25}
              height={25}
            ></Image>
            <span>Feedback</span>
          </li>
        </Link>
        <li className={styles.list} onClick={onClickLogout}>
          <Image
            src={"/logout.svg"}
            alt="logout icon"
            width={25}
            height={25}
          ></Image>
          <span style={{ color: "rgba(233, 4, 4, 1)" }}>Logout</span>
        </li>
      </ul>
    </div>
  );
}

//prettier ignore
function Recipe({
  mediaContext,
  userContext,
  recipeWidth,
}: {
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  recipeWidth: string;
}) {
  ///design
  const fontSize =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.045, "4.5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.03, "2.7vw")
      : getSize(recipeWidth, 0.026, "1.2vw");
  const headerSize =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.05, "5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.04, "3.5vw")
      : getSize(recipeWidth, 0.033, "1.5vw");
  const marginTop = getSize(recipeWidth, 0.11, "30px");

  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE>();
  //use curRecipe to modify the recipe value
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
  const [favorite, setFavorite] = useState<boolean>();
  const [servingsValue, setServingsValue] = useState<number>();
  const [ingredientsUnit, setIngredientsUnit] = useState<
    "original" | "metric" | "us" | "japan" | "australia" | "metricCup"
  >("original");

  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
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
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      //recipe is stored inside _doc of data.data
      //images are stored in data.data
      const recipe = { ...data.data._doc };
      recipe.mainImage = data.data.mainImage;
      recipe.instructions = data.data.instructions;
      recipe.memoryImages = data.data.memoryImages;

      console.log(recipe);
      setStateInitNoImages(recipe);

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
            fontSize: `calc(${fontSize} * 0.9)`,
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
            width: "100%",
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding:
              mediaContext === "mobile"
                ? "10% 0"
                : mediaContext === "tablet"
                ? "6% 0"
                : "3% 0",
            color: "rgb(60, 0, 116)",
          }}
        >
          <ImageTitle
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            image={recipe.mainImage}
            title={recipe.title}
          />
          <BriefExplanation
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            curRecipe={curRecipe}
            servingsValue={servingsValue}
            favorite={favorite}
            ingredientsUnit={ingredientsUnit}
            onChangeServings={handleChangeServings}
            onChangeIngredientsUnit={handleChangeIngredientsUnit}
            onClickFavorite={handleClickFavorite}
          />
          <Ingredients
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            servingsValue={servingsValue}
            ingredients={curRecipe.ingredients}
            ingredientsUnit={ingredientsUnit}
          />
          <Instructions
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            instructions={recipe.instructions}
          />
          <AboutThisRecipe
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            description={recipe.description}
          />
          <Memories
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            images={recipe.memoryImages}
          />
          <Comments
            mediaContext={mediaContext}
            fontSize={fontSize}
            headerSize={headerSize}
            marginTop={marginTop}
            comments={recipe.comments}
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

function ImageTitle({
  mediaContext,
  recipeWidth,
  fontSize,
  image,
  title,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  image: TYPE_FILE | undefined;
  title: string;
}) {
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.8, "250px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.72, "400px")
      : getSize(recipeWidth, 0.65, "440px");
  const height =
    parseInt(width) * (mediaContext === "mobile" ? 0.65 : 0.6) + "px";

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
          width={parseInt(width)}
          height={parseInt(height)}
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
            fontSize: `calc(${fontSize} * 1.5)`,
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
  mediaContext,
  recipeWidth,
  fontSize,
  curRecipe,
  servingsValue,
  ingredientsUnit,
  favorite,
  onChangeServings,
  onChangeIngredientsUnit,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  curRecipe: TYPE_RECIPE;
  servingsValue: number;
  ingredientsUnit: string;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIngredientsUnit: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickFavorite: () => void;
}) {
  const width = getSize(recipeWidth, 0.9, "90%");
  const fontSizeBrief = parseFloat(fontSize) * 0.9 + "px";
  const iconSize = parseFloat(fontSizeBrief);
  const fontFukidashiSize = `calc(${fontSizeBrief} * 0.9)`;

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
        margin: mediaContext === "mobile" ? "10% 0 5% 0" : "6% 0 5% 0 ",
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
          padding: mediaContext === "mobile" ? "5% 3%" : "3%",
          backgroundColor: "rgb(255, 217, 0)",
          borderRadius: "1% / 7%",
          gap: "20%",
          boxShadow: "rgba(0, 0, 0, 0.27) 3px 3px 5px",
        }}
      >
        <div
          className={styles.container__author_servings}
          style={{ gap: mediaContext === "mobile" ? "6%" : "2%" }}
        >
          <div
            className={styles.container__fukidashi}
            style={{
              top: "-275%",
              left: "0%",
              opacity: !mouseOver[0] ? 0 : 1,
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
          <span style={{ width: "19%", fontSize: fontSizeBrief }}>
            {author}
          </span>
          <div
            className={styles.container__fukidashi}
            style={{
              top: "-290%",
              left: "30%",
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
            style={{ width: "17%", fontSize: fontSizeBrief }}
            type="number"
            min="1"
            max={MAX_SERVINGS}
            name="servings"
            placeholder="Servings"
            value={servingsValue}
            onChange={onChangeServings}
          />
          <span style={{ width: "20%", fontSize: fontSizeBrief }}>
            {servingsUnit !== "other" ? servingsUnit : servingsCustomUnit}
          </span>
        </div>
        <div
          className={styles.container__units}
          style={{ gap: mediaContext === "mobile" ? "5%" : "2%" }}
        >
          <div
            className={styles.container__fukidashi}
            style={{
              top: "-280%",
              left: "0%",
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
            style={{ width: "25%", fontSize: fontSizeBrief }}
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
            className={styles.container__fukidashi}
            style={{
              top: "-275%",
              left: "30%",
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
          width: mediaContext === "mobile" ? "7%" : "4.5%",
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
  mediaContext,
  fontSize,
  headerSize,
  servingsValue,
  ingredients,
  ingredientsUnit,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  headerSize: string;
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
      <h2
        className={styles.header}
        style={{
          fontSize: headerSize,
          marginBottom: `calc(${headerSize} * 0.5)`,
        }}
      >
        Ingredients
      </h2>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: mediaContext === "mobile" ? "1fr" : "1fr 1fr",
          justifyItems: "left",
          marginTop: "2%",
          wordSpacing: "0.1vw",
          columnGap: "5%",
          paddingLeft: "0",
        }}
      >
        {ingredients.map((ing, i) => (
          <IngLine
            key={i}
            fontSize={fontSize}
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
  fontSize,
  servingsValue,
  ingredient,
  ingredientsUnit,
}: {
  fontSize: string;
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
        alignItems: "center",
        gap: "4%",
        whiteSpace: "nowrap",
        fontSize: fontSize,
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
  mediaContext,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  instructions,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  instructions: { instruction: string; image: TYPE_FILE | undefined }[];
}) {
  return (
    <div
      style={{
        position: "relative",
        marginTop: marginTop,
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
      {instructions.map((inst, i) => (
        <Instruction
          key={i}
          mediaContext={mediaContext}
          recipeWidth={recipeWidth}
          fontSize={fontSize}
          instruction={inst}
          i={i}
        />
      ))}
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
      ? getSize(recipeWidth, 0.27, "100px")
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
        ? getSize(recipeWidth, 0.27, "100px")
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
        gap: "5%",
        width: "100%",
        height: "fit-content",
        backgroundColor: "rgba(255, 255, 236, 0.91)",
        padding: "4% 3%",
        fontSize: fontSize,
        letterSpacing: "0.06vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          width: "25px",
          aspectRatio: "1",
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
          letterSpacing: "0.03vw",
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
  fontSize,
  headerSize,
  marginTop,
  description,
}: {
  mediaContext: TYPE_MEDIA;
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
        marginTop: marginTop,
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
          fontSize:
            mediaContext === "mobile" ? fontSize : `calc(${fontSize} * 0.9)`,
          letterSpacing: "0.03vw",
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
      : getSize(recipeWidth, 0.5, "400px");
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
        marginTop: marginTop,
        width: mediaContext === "mobile" ? "90%" : "60%",
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
        {images.length ? (
          images.map((img, i) => (
            <MemoryImg
              key={i}
              width={width}
              height={height}
              i={i}
              image={img}
              translateX={calcTransitionXSlider(i, curImage)}
            />
          ))
        ) : (
          <></>
        )}
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
          <p
            className={styles.no_content}
            style={{ fontSize: `calc(${fontSize} * 0.9)`, height: "100%" }}
          >
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
        marginTop: marginTop,
        width: mediaContext === "mobile" ? "90%" : "70%",
        aspectRatio: comments ? "1/0.5" : "1/0.3",
        // height: comments ? "200px" : "150px",
      }}
    >
      <h2
        className={styles.header}
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        {" "}
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
            fontSize:
              mediaContext === "mobile" ? fontSize : `calc(${fontSize} * 0.9)`,
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

function Timers({
  mediaContext,
  timerWidth,
}: {
  mediaContext: TYPE_MEDIA;
  timerWidth: string;
}) {
  const MAX_TIMERS = 10;
  const fontSize =
    mediaContext === "mobile"
      ? getSize(timerWidth, 0.045, "3.5vw")
      : getSize(timerWidth, 0.027, "1.2vw");

  const [timerKeys, setTimerKeys] = useState(
    Array(1)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
  );

  const handleDeleteTimers = function (i: number) {
    if (!timerKeys.length) return;
    setTimerKeys((prev) => prev.toSpliced(i, 1));
  };

  const handleAddTimers = function () {
    if (timerKeys.length === MAX_TIMERS) return;
    setTimerKeys((prev) => [...prev, { id: nanoid() }]);
  };

  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: "linear-gradient(rgb(255, 217, 0), rgb(255, 166, 1))",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        scrollbarColor: "rgb(255, 199, 125) rgb(212, 120, 0)",
        textAlign: "center",
        padding: "3% 0 1% 0",
      }}
    >
      <h2
        style={{
          fontSize: `calc(${fontSize} * 1.4)`,
          letterSpacing: "0.1vw",
          marginBottom: "5%",
        }}
      >
        Timers
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: mediaContext === "mobile" ? "1fr" : "1fr 1fr",
          rowGap: mediaContext === "mobile" ? "3%" : "0",
          justifyItems: "center",
          width: mediaContext === "mobile" ? "90%" : "100%",
          height: "fit-content",
          fontSize: fontSize,
        }}
      >
        {timerKeys.map((keyObj, i) => (
          <Timer
            key={keyObj.id}
            fontSize={fontSize}
            index={i}
            onClickDelete={handleDeleteTimers}
          />
        ))}
        {timerKeys.length === MAX_TIMERS || (
          <div
            className={styles.container__timer}
            style={{ justifyContent: "center" }}
          >
            <button
              className={styles.btn__timer}
              style={{
                width: "fit-content",
                aspectRatio: "1",
                letterSpacing: "0.05vw",
                lineHeight: "105%",
                padding: "4%",
                backgroundImage:
                  "linear-gradient(rgb(251, 255, 0), rgb(255, 217, 0))",
                fontSize: `calc(${fontSize} * 0.9)`,
              }}
              onClick={handleAddTimers}
            >
              +<br />
              Add
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Timer({
  fontSize,
  index,
  onClickDelete,
}: {
  fontSize: string;
  index: number;
  onClickDelete: (i: number) => void;
}) {
  const MAX_HOURS = 23;
  const MAX_MINUTES = 59;
  const MAX_SECONDS = 59;

  //design
  const fontSizeTimeInput = parseFloat(fontSize) * 1.2 + "px";
  const fontSizeControlBtn = parseFloat(fontSize) * 0.9 + "px";

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultTime = { hours: "", minutes: "", seconds: "" };
  const [title, setTitle] = useState(`Timer ${index + 1}`);
  const [time, setTime] = useState(defaultTime);
  const [paused, setPaused] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  function isTimerSet() {
    return !time.hours && !time.minutes && !time.seconds ? false : true;
  }

  const handleChangeTitle = function (e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.currentTarget.value);
  };

  useEffect(() => {
    if (!isTimerSet()) return;

    //if paused is true, get rid of the timeout
    if (paused) {
      timeoutId && clearTimeout(timeoutId);
      return;
    }

    const id = setTimeout(() => {
      const numberHours = parseInt(time.hours);
      const numberMinutes = parseInt(time.minutes);
      const numberSeconds = parseInt(time.seconds);

      if (!numberHours && !numberMinutes && !numberSeconds)
        return audioRef.current?.play();

      setNewTime(numberSeconds, numberMinutes, numberHours);
    }, 1000);

    setTimeoutId(id);

    return () => clearTimeout(id);
  }, [time, paused]);

  function setNewTime(
    curNumberSeconds: number,
    curNumberMinutes: number,
    curNumberHours: number
  ) {
    const nextSeconds = !curNumberSeconds
      ? "59"
      : (curNumberSeconds - 1).toString().padStart(2, "0");

    let nextMinutes: string = "0";
    if (nextSeconds === "59") {
      if (!curNumberMinutes) nextMinutes = "59";
      if (curNumberMinutes)
        nextMinutes = (curNumberMinutes - 1).toString().padStart(2, "0");
    } else {
      nextMinutes = time.minutes;
    }

    let nextHours: string = "0";
    if (nextSeconds === "59" && nextMinutes === "59") {
      if (!curNumberHours) nextHours = "00";
      if (curNumberHours)
        nextHours = (curNumberHours - 1).toString().padStart(2, "0");
    } else {
      nextHours = time.hours;
    }

    setTime({
      hours: nextHours,
      minutes: nextMinutes,
      seconds: nextSeconds,
    });
  }

  const handleStart = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const inputHours = +(formData.get("hours") || 0);
    const inputMinutes = +(formData.get("minutes") || 0);
    const inputSeconds = +(formData.get("seconds") || 0);

    if (!validateTime(inputHours, inputMinutes, inputSeconds)) return;

    const newTime = convertTime(inputHours, inputMinutes, inputSeconds);
    if (!newTime) return;

    setTime(newTime);
  };

  function convertTime(hours: number, minutes: number, seconds: number) {
    if (hours > MAX_HOURS) return null;

    //all fields within the allowed range
    if (minutes <= MAX_MINUTES && seconds <= MAX_SECONDS)
      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      };

    //minutes, seconds, or both are not within the allowd range => convert
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
  }

  function validateTime(hours: number, minutes: number, seconds: number) {
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
  }

  const handleStop = function () {
    if (
      parseInt(time.hours) ||
      parseInt(time.minutes) ||
      parseInt(time.seconds)
    )
      return setPaused(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTime(defaultTime);
  };

  const togglePaused = () => {
    setPaused(!paused);
  };

  const handlePause = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "start") return;

    if (!isTimerSet()) return;

    togglePaused();
  };

  const handleRestart = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "pause") return;

    togglePaused();
  };

  const handleReset = function () {
    if (!isTimerSet()) return;

    setTime(defaultTime);
  };

  return (
    <form
      className={styles.container__timer}
      style={{
        backgroundColor: "rgb(255, 245, 199)",
        gap: "8%",
        boxShadow: "rgba(0, 0, 0, 0.267) 3px 3px 8px",
      }}
      data-timer={index}
      onSubmit={handleStart}
    >
      <audio loop ref={audioRef} src="/timerAlerm.mp3"></audio>
      <button
        className={styles.btn__timer}
        style={{
          position: "absolute",
          backgroundColor: "orange",
          width: "7%",
          aspectRatio: "1",
          top: "2%",
          right: "1%",
          fontWeight: "bold",
          fontSize: `calc(${fontSize} * 0.7)`,
        }}
        type="button"
        onClick={() => {
          onClickDelete(index);
          handleStop();
        }}
      >
        &times;
      </button>
      <input
        style={{
          width: "80%",
          height: "16%",
          textAlign: "center",
          marginTop: "8%",
          borderRadius: "2% / 18%",
          borderColor: "orange",
          fontSize: fontSize,
        }}
        type="text"
        placeholder="Set title for timer"
        value={title}
        onChange={handleChangeTitle}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: "3%",
          width: "80%",
          whiteSpace: "nowrap",
        }}
      >
        {!isTimerSet() ? (
          <>
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeTimeInput }}
              name="hours"
              type="number"
              placeholder="h"
              min="0"
              max="23"
              defaultValue={time.hours}
            />
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeTimeInput }}
              name="minutes"
              type="number"
              placeholder="min"
              min="0"
              max="59"
              defaultValue={time.minutes}
            />
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeTimeInput }}
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
            <span
              style={{
                fontSize: `calc(${fontSize}* 1.7)`,
                letterSpacing: "0.07vw",
              }}
            >
              {time.hours} : {time.minutes} : {time.seconds}
            </span>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "100%",
          height: "fitContent",
          gap: "6%",
        }}
      >
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeControlBtn,
            backgroundColor: "greenyellow",
          }}
          type="submit"
          onClick={handleStop}
        >
          {!isTimerSet() ? "Start" : "Stop"}
        </button>
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeControlBtn,
            backgroundColor: "rgb(255, 153, 0)",
          }}
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
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeControlBtn,
            backgroundColor: "rgb(191, 52, 255)",
          }}
          type="reset"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function Note({
  mediaContext,
  noteWidth,
}: {
  mediaContext: TYPE_MEDIA;
  noteWidth: string;
}) {
  return (
    <textarea
      style={{
        resize: "none",
        border: "none",
        backgroundImage:
          "linear-gradient(rgb(254, 255, 213), rgb(254, 255, 186))",
        width: "100%",
        overflowY: "auto",
        scrollbarColor: "rgb(255, 250, 209) rgb(255, 231, 92)",
        fontSize:
          mediaContext === "mobile"
            ? getSize(noteWidth, 0.047, "4vw")
            : getSize(noteWidth, 0.03, "1.3vw"),
        letterSpacing: mediaContext === "mobile" ? "0.1vw" : "0.05vw",
        padding: "2% 2.8%",
        zIndex: "1",
      }}
      contentEditable="true"
      placeholder="Use this section for anything :)"
    ></textarea>
  );
}
