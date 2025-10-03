"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { create } from "domain";
import { nanoid } from "nanoid";
import fracty from "fracty";
import {
  calcNumberOfPages,
  getFilteredRecipes,
  getRecipesPerPage,
  convertTempUnits,
  convertIngUnits,
  calcTransitionXSlider,
  recipes,
  updateConvertion,
  updateIngsForServings,
} from "../helper";
import { TYPE_RECIPE } from "../config";
import DropdownMenu from "./(dropdown)/page";

export default function MAIN() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
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

  function handleClickPreview(recipe: TYPE_RECIPE) {
    setCurRecipe(recipe);
  }

  function updateRecipeFavorite(newFavoriteStatus: boolean) {
    let recipe = recipes.find(
      (recipe: TYPE_RECIPE) => recipe.id === curRecipe?.id
    );
    if (!recipe) return;
    const newRecipe = { ...recipe };
    newRecipe.favorite = newFavoriteStatus;
    recipe = newRecipe;

    setCurRecipe(recipe);
  }

  return (
    <div
      className={clsx(styles.page__main)}
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
            //for dev
            // backgroundColor: "blue",
            // opacity: "0.5",
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
            onClickPreview={handleClickPreview}
          />
          <Recipe
            curRecipe={curRecipe}
            updateRecipeFavorite={updateRecipeFavorite}
          />
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
              //for dev
              // backgroundColor: "blue",
              // opacity: "0.5",
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
  onClickPreview,
}: {
  isSearchVisible: boolean;
  searchRef: any;
  onClickSearch: () => void;
  onClickPreview: (recipe: TYPE_RECIPE) => void;
}) {
  const RECIPES_PER_PAGE = 6;
  const [input, setInput] = useState("");
  const [curRecipes, setCurRecipes] = useState<TYPE_RECIPE[]>([]);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [page, setPage] = useState(1);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const getRecipes = (value: string = input) => {
    if (!recipes.length) return;

    const filteredRecipes = getFilteredRecipes(value);

    setNumberOfPages(calcNumberOfPages(filteredRecipes, RECIPES_PER_PAGE));

    return getRecipesPerPage(filteredRecipes, RECIPES_PER_PAGE, page);
  };

  const handleChangeInput = function (e: React.ChangeEvent<HTMLInputElement>) {
    if (timeoutId) clearTimeout(timeoutId);

    const value = e.currentTarget.value.trim().toLowerCase();

    const id = setTimeout(() => {
      if (!value) return;
      setInput(value);
      setPage(1);

      const nextRecipes = getRecipes(value);
      nextRecipes && setCurRecipes(nextRecipes);
    }, 500);

    setTimeoutId(id);
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  //I'm gonna make it work for arrow keydown event later too!
  function handlePagination(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;

    target.value === "decrease"
      ? setPage((prev) => prev - 1)
      : setPage((prev) => prev + 1);
  }

  useEffect(() => {
    const nextRecipes = getRecipes();
    nextRecipes && setCurRecipes(nextRecipes);
  }, [page]);

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
          {!curRecipes.length ? (
            <p className={styles.no_results}>0 search results</p>
          ) : (
            curRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className={styles.recipe_preview}
                onClick={() => onClickPreview(recipe)}
              >
                {recipe.mainImage && (
                  <Image
                    className={styles.img__main}
                    src={recipe.mainImage}
                    alt="main image"
                    width={50}
                    height={50}
                  ></Image>
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
        {page > 1 && (
          <button
            className={clsx(
              styles.btn__pagination,
              styles.btn__pagination_left
            )}
            type="button"
            value="decrease"
            onClick={handlePagination}
          >
            Page {page - 1}
            <br />
            &larr;
          </button>
        )}
        {page < numberOfPages && (
          <button
            className={clsx(
              styles.btn__pagination,
              styles.btn__pagination_right
            )}
            type="button"
            value="increase"
            onClick={handlePagination}
          >
            Page {page + 1}
            <br />
            &rarr;{" "}
          </button>
        )}
      </div>
    </div>
  );
}

//prettier ignore
function Recipe({
  curRecipe,
  updateRecipeFavorite,
}: {
  curRecipe: any;
  updateRecipeFavorite: (newFavoriteStatus: boolean) => void;
}) {
  const [recipe, setRecipe] = useState(curRecipe);

  const [servingsValue, setServingsValue] = useState(
    curRecipe?.servings.servings
  );
  const [temperatureUnit, setTemperatureUnit] = useState<"℉" | "℃">(
    curRecipe?.temperatures.unit
  );
  const [ingredientsUnit, setIngredientsUnit] = useState(
    curRecipe?.servings.unit
  );
  const [favorite, setFavorite] = useState(curRecipe?.favorite);
  const [curSlide, setCurSlide] = useState(0);
  const [maxSlide, setMaxSlide] = useState(curRecipe?.memoryImages.length - 1);

  useEffect(() => {
    setRecipe(curRecipe);
    setServingsValue(curRecipe?.servings.servings);
    setTemperatureUnit(curRecipe?.temperatures.unit);
    setIngredientsUnit(curRecipe?.servings.unit);
    setFavorite(curRecipe?.favorite);
    setCurSlide(0);
    setMaxSlide(curRecipe?.memoryImages.length - 1);
  }, [curRecipe]);

  // useEffect(() => {
  //   const id = setInterval(() => {
  //     setCurSlide((prev) => (prev === maxSlide ? 0 : prev + 1));
  //   }, 5000);

  //   return () => {
  //     clearInterval(id);
  //   };
  // }, []);

  // const updateIngsForServings = (servings: number) => {
  //   const newIngs = curRecipe.ingredients.map(
  //     (ing: {
  //       ingredient: string;
  //       amount: number | string;
  //       unit: string;
  //       id: number;
  //     }) => {
  //       ///calclate ing for one serivng first then multiply it by new servings
  //       const newAmount =
  //         typeof ing.amount === "string"
  //           ? `${(1 / curRecipe.servings.servings) * servings} ${ing.amount}`
  //           : +((ing.amount / curRecipe.servings.servings) * servings).toFixed(
  //               1
  //             );

  //       const newIng = { ...ing };
  //       newIng.amount = newAmount;
  //       return newIng;
  //     }
  //   );

  //   return newIngs; //array of updated ingredients for new servings
  // };

  function handleChangeServings(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);
    setRecipe((prev: any) => {
      const newRecipe = { ...prev };
      newRecipe.ingredients = updateIngsForServings(newValue, curRecipe);
      //update convertion for updated ing amount
      return updateConvertion(newRecipe);
    });
  }

  function handleChangeIngUnit(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.currentTarget.value;
    setIngredientsUnit(newValue);
  }

  function handleChangeTempUnit(e: React.ChangeEvent<HTMLSelectElement>) {
    //if the value hasn't change => return;
    const newValue = e.currentTarget.value;
    if ((newValue !== "℉" && newValue !== "℃") || newValue === temperatureUnit)
      return;

    //otherwise set new temperature unit
    setTemperatureUnit(newValue);
    //and set converted temperature
    setRecipe((prev: any) => {
      const newRecipe = { ...prev };
      const newTemp = prev.temperatures.temperatures.map((temp: number) =>
        convertTempUnits(temp, newValue === "℃" ? "℉" : "℃")
      );
      newRecipe.temperatures = { temperatures: newTemp, unit: newValue };
      return newRecipe;
    });
  }

  function handleClickFavorite() {
    const newFavoriteStatus = !favorite;
    setFavorite(newFavoriteStatus);
    updateRecipeFavorite(newFavoriteStatus);
  }

  function handleClickDots(i: number) {
    setCurSlide(i);
  }

  return (
    <div className={styles.container__recipe}>
      {recipe ? (
        <>
          <img
            className={styles.img__main}
            src={recipe.mainImage || "/grey-img.png"}
            alt="main image"
          ></img>
          <div className={styles.title_wrapper}>
            <h2 className={styles.title}>{recipe.title}</h2>
          </div>
          <div className={styles.container__description_favorite}>
            <div className={styles.container__description}>
              <div className={styles.container__author_servings}>
                <p>Author</p>
                <span className={styles.author}>{recipe.author}</span>
                <p>Servings</p>
                <input
                  id={styles.input__servings}
                  type="number"
                  min="1"
                  max="500"
                  value={servingsValue}
                  onChange={handleChangeServings}
                />
                <span className={styles.servings_unit}>
                  {recipe.servings.unit}
                </span>
              </div>
              <div className={styles.container__ingredients_unit}>
                <p>Ingredients Unit</p>
                <select
                  id={styles.input__ingredients_unit}
                  value={ingredientsUnit}
                  onChange={handleChangeIngUnit}
                >
                  <option value="metric">Metric</option>
                  <option value="us">US</option>
                  <option value="japan">Japan</option>
                  <option value="australia">Australia</option>
                  <option value="metricCup">Metric cup (1cup = 250ml)</option>
                </select>
              </div>
              <div className={styles.container__temperature_unit}>
                <p>Temperature</p>
                <span className={styles.temperature}>
                  {recipe.temperatures.temperatures.join("/")}
                </span>
                <select
                  id={styles.input__temperature_units}
                  value={temperatureUnit}
                  onChange={handleChangeTempUnit}
                >
                  <option value="℃">℃</option>
                  <option value="℉">℉</option>
                </select>
              </div>
            </div>
            <button
              className={clsx(
                styles.btn__favorite,
                favorite && styles.btn__favorite_on
              )}
              onClick={handleClickFavorite}
            ></button>
          </div>
          <div className={styles.container__ingredients}>
            <h3>~ Ingredients ~</h3>
            <div className={styles.ingredients}>
              {recipe.ingredients.map((ing: any) => {
                const newIng = ing.convertion[ingredientsUnit]
                  ? ing.convertion[ingredientsUnit]
                  : ing;

                return (
                  <div key={nanoid()} className={styles.ingredient_line}>
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
              })}
            </div>
          </div>

          <div className={styles.container__instructions}>
            <h2>~ Instructions ~</h2>
            {recipe.instructions.map((step: any, i: number) => (
              <div key={nanoid()} className={styles.step}>
                <div className={styles.container__step_step_img}>
                  <p>
                    <span>{i + 1}</span> {step.instruction}
                  </p>
                  {step.image && (
                    <img
                      src={step.image || "/grey-img.png"}
                      alt={`step ${i + 1} image`}
                    ></img>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.container__recipe_description}>
            <h2>~ About this recipe ~</h2>
            <p>{recipe.description}</p>
          </div>
          {recipe.memoryImages.length && (
            <div className={styles.container__slider}>
              <h2>~ Memories of the recipe ~</h2>
              <div className={styles.slider__imgs}>
                {recipe.memoryImages.map((img: string, i: number) => (
                  <img
                    key={nanoid()}
                    src={img || "/grey-img.png"}
                    alt={`memory image${i + 1}`}
                    style={{
                      transform: calcTransitionXSlider(i, curSlide),
                    }}
                  ></img>
                ))}
                <div
                  style={{
                    position: "absolute",
                    width: "70%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: "1.7%",
                    bottom: "5%",
                  }}
                >
                  {recipe.memoryImages.map((_: any, i: number) => (
                    <button
                      key={nanoid()}
                      className={styles.btn__dot}
                      style={{ opacity: i === curSlide ? "0.6" : "0.3" }}
                      onClick={() => handleClickDots(i)}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.container__comments}>
            <h2>~ Comments ~</h2>
            <div className={styles.comments_wrapper}>
              <div
                className={styles.comments}
                contentEditable="true"
                defaultValue="Use this space for free :)"
              >
                {recipe.comments}
              </div>
            </div>
          </div>

          <div className={styles.container__nutrition_facts}>
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
              {/* <p style={{ color: "red", width: "95%", marginTop: "2%" }}>
                ※ Couldn't find the information of aaaa, and aaa, so that is
                excluded here.
              </p> */}
            </div>
          </div>
        </>
      ) : (
        <p className={styles.no_recipe}>Let's start by selecting a recipe :)</p>
      )}
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
