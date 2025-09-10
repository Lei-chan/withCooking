"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { create } from "domain";
import { nanoid } from "nanoid";

//success!
async function getNutritionData(
  id: number,
  amount: number | string,
  unit: string
) {
  try {
    const res = await fetch(
      `https://api.spoonacular.com/food/ingredients/${id}/information?amount=${amount}&unit=${unit}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message);
      err.statusCode = res.status;
      throw err;
    }

    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
//success!!
async function getSuggestion(foodName: string) {
  try {
    const res = await fetch(
      `https://api.spoonacular.com/food/ingredients/autocomplete?query=${foodName}&number=20&language=en&metaInformation=true&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message);
      err.statusCode = res.status;
      throw err;
    }

    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

const convertTemperature = (
  value: number,
  optionFrom: "F" | "f" | "C" | "c"
) => {
  let result;

  if (optionFrom.toLowerCase() === "f") result = (value - 32) * (5 / 9);

  if (optionFrom.toLowerCase() === "c") result = value * (9 / 5) + 32;

  return result?.toFixed(1);
};

////local units are more important to convert to different units later
// const getLocation = (ingredient: object) => {
//   if (
//     ingredient.unit === "US cups" ||
//     ingredient.unit === "oz" ||
//     ingredient.unit === "lb"
//   )
//     return "us";
//   if (ingredient.unit === "Japanese cups") return "japan";
//   if (ingredient.unit === "Imperial cups") return "metricCup";
//   if (ingredient.unit === "Australian Tbsp") return "australia";

//   return "metric";
// };

// prettier-ignore
const convertIngUnits = (
  amount: number,
  unit: "g" | "kg" | "oz" | "lb" | "ml" | "L" | "cupUS" | "cupJapan" | "cupImperial" | "riceCup" | "tsp" | "Tbsp" | "TbspAustralia" | "noUnit"
) => {
  let metric;
  let us;
  let japan;
  let australia;
  let metricCup;

  if (unit === "g") us = { amount: (amount / 28.3495).toFixed(1), unit: "oz" };

  if (unit === "kg") us = { amount: (amount * 2.20462).toFixed(1), unit: "lb" };

  if (unit === "ml") {
    us = { amount: (amount / 240).toFixed(1), unit: "cupUs" };
    japan = { amount: (amount / 200).toFixed(1), unit: "cupJapan" };
    metricCup = { amount: (amount / 250).toFixed(1), unit: "cupImperial" };
  }

  if (unit === "L") {
    us = { amount: (amount * 4.167).toFixed(1), unit: "cupUS" };
    japan = { amount: (amount * 5).toFixed(1), unit: "cupJapan" };
    metricCup = { amount: (amount * 4).toFixed(1), unit: "cupImperial" };
  }

  if (unit === "Tbsp")
    australia = { amount: (amount * 0.75).toFixed(1), unit: "TbspAustralia" };

  if (unit === "oz")
    metric = { amount: (amount * 28.3495).toFixed(1), unit: "g" };

  if (unit === "lb")
    metric = { amount: (amount / 35.274).toFixed(1), unit: "kg" };

  if (unit === "cupUS") {
    japan = [
      { amount: (amount * 1.2).toFixed(1), unit: "cupJapan" },
      { amount: (amount * 1.3333).toFixed(1), unit: "riceCup" },
    ];
    metric = { amount: (amount * 240).toFixed(1), unit: "ml" };
    metricCup = { amount: (amount * 0.96).toFixed(1), unit: "cupImperial" };
    australia = metricCup;
  }

  if (unit === "cupJapan") {
    us = { amount: (amount * 0.833).toFixed(1), unit: "cupUS" };
    metricCup = { amount: (amount * 0.8).toFixed(1), unit: "metricCup" };
    metric = { amount: (amount * 200).toFixed(1), unit: "ml" };
  }

  if (unit === "riceCup") {
    us = { amount: (amount * 0.75).toFixed(1), unit: "cupUS" };
    metricCup = { amount: (amount * 0.72).toFixed(1), unit: "cupImperial" };
    metric = { amount: (amount * 180).toFixed(1), unit: "ml" };
    japan = { amount: (amount * 0.9).toFixed(1), unit: "cupJapan" };
  }

  if (unit === "tsp") metric = { amount: (amount * 5).toFixed(1), unit: "ml" };

  if (unit === "Tbsp") {
    metric = { amount: (amount * 15).toFixed(1), unit: "ml" };
    australia = { amount: (amount * 0.75).toFixed(1), unit: "TbspAustralia" };
  }

  if (unit === "TbspAustralia") {
    us = { amount: (amount * 1.3333).toFixed(1), unit: "Tbsp" };
    japan = us;
    metric = { amount: (amount * 20).toFixed(1), unit: "ml" };
  }

  if (unit === "cupImperial") {
    us = { amount: (amount * 1.041).toFixed(1), unit: "cupUS" };
    japan = { amount: (amount * 1.25).toFixed(1), unit: "cupJapan" };
    metric = { amount: (amount * 250).toFixed(1), unit: "ml" };
  }

  return {
    metric: metric || "",
    us: us || "",
    japan: japan || "",
    australia: australia || "",
    metricCup: metricCup || "",
  };
};

console.log(convertIngUnits(2, "cupUS"));

//for dev
const recipes = [
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      { ingredient: "olives", amount: "1", unit: "can", id: 9226 },
      { ingredient: "flour", amount: "250", unit: "g", id: 9226 },
    ],
    instructions: [
      {
        instruction: "First put eggs in a bowl and mix with sugar.",
        image: "",
      },
      { instruction: "Add soy milk and set it aside.", image: "" },
    ],
    description: "This is our family's favorite recipe!",
    memoryImages: ["", ""],
    comments: "",
  },
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      { ingredient: "strawberries", amount: "2", unit: "UScups", id: 9226 },
      { ingredient: "flour", amount: "250", unit: "oz", id: 9226 },
      { ingredient: "eggs", amount: "2 large", unit: "", id: 9226 },
    ],
    instructions: [
      {
        instruction: "First put eggs in a bowl and mix with sugar.",
        image: "",
      },
      { instruction: "Add soy milk and set it aside.", image: "" },
    ],
    description: "This is our family's favorite recipe!",
    memoryImages: ["", ""],
    comments: "",
  },
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℃" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g", id: 9226 },
      { ingredient: "water", amount: "1", unit: "L" },
      { ingredient: "salt", amount: "2", unit: "tsp", id: 9226 },
    ],
    instructions: [
      {
        instruction: "First put eggs in a bowl and mix with sugar.",
        image: "",
      },
      { instruction: "Add soy milk and set it aside.", image: "" },
    ],
    description: "This is our family's favorite recipe!",
    memoryImages: ["", ""],
    comments: "",
  },
];

const DropdownMenu = function ({
  isDropdownVisible,
  onClickDropdown,
}: {
  isDropdownVisible: boolean;
  onClickDropdown: () => void;
}) {
  return (
    <div
      className={styles.container__dropdown}
      style={{ pointerEvents: !isDropdownVisible ? "none" : "all" }}
    >
      <button
        className={styles.btn__dropdown}
        type="button"
        onClick={onClickDropdown}
      ></button>
      <ul
        className={clsx(styles.dropdown_menu)}
        style={{ opacity: !isDropdownVisible ? 0 : 1 }}
      >
        <Link href="http://localhost:3000/recipes">
          <li>Recipes</li>
        </Link>
        <Link href="http://localhost:3000/converter">
          <li>Converter</li>
        </Link>
        <Link href="http://localhost:3000/account">
          <li>Account</li>
        </Link>
        <li>Logout</li>
        <Link href="http://localhost:3000/how-to-use">
          <li>How to use</li>
        </Link>
        <Link href="http://localhost:3000/news">
          <li>News</li>
        </Link>
        <Link href="">
          <li>Feedback</li>
        </Link>
      </ul>
    </div>
  );
};

const Search = function ({
  isSearchVisible,
  searchRef,
  onClickSearch,
  onClickPreview,
}: {
  isSearchVisible: boolean;
  searchRef: any;
  onClickSearch: () => void;
  onClickPreview: (recipe: {
    id: number; //for now
    favorite: boolean;
    mainImage: string;
    title: string;
    author: string;
    servings: { servings: number; unit: string };
    temperatures: { temperatures: number[] | string[]; unit: "℃" | "℉" };
    ingredients: {
      ingredient: string;
      amount: number | string;
      unit: string;
    }[];
    instructions: { instruction: string; image: string }[];
    description: string;
    memoryImages: string[];
    comments: string;
  }) => void;
}) {
  const RECIPE_PER_PAGE = 6;
  const [input, setInput] = useState("");
  const [curRecipes, setCurRecipes] = useState<object[]>([]);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [page, setPage] = useState(1);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const updateNumberOfPages = (recipes: Object[]) => {
    setNumberOfPages(Math.ceil(recipes.length / RECIPE_PER_PAGE));
  };

  const getRecipesPerPage = (value: string = input) => {
    if (!recipes.length) return;

    const structuredValue = value.trim().toLowerCase();
    const filteredRecipes = recipes.filter(
      (recipe) =>
        recipe.title.toLocaleLowerCase().includes(structuredValue) ||
        recipe.ingredients.find((ing) =>
          ing.ingredient.toLowerCase().includes(structuredValue)
        )
    );

    updateNumberOfPages(filteredRecipes);

    const startIndex = (page - 1) * RECIPE_PER_PAGE;
    const endIndex = startIndex + RECIPE_PER_PAGE;
    const recipesPerPage = filteredRecipes.slice(startIndex, endIndex);

    return recipesPerPage;
  };

  const handleChangeInput = function (e: React.ChangeEvent<HTMLInputElement>) {
    if (timeoutId) clearTimeout(timeoutId);

    const value = e.currentTarget.value.trim().toLowerCase();

    const id = setTimeout(() => {
      if (!value) return;
      setInput(value);
      setPage(1);

      const nextRecipes = getRecipesPerPage(value);
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
    const nextRecipes = getRecipesPerPage();
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
                <img
                  className={styles.img__main}
                  src={recipe.mainImage || "/grey-img.png"}
                  alt="main image"
                ></img>
                <p className={styles.title}>{recipe.title}</p>
                {recipe.favorite && (
                  <Image
                    className={styles.img__favorite}
                    src="/star-on.png"
                    alt="favorite icon"
                    width={512}
                    height={512}
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
};

const Recipe = function ({
  curRecipe,
  updateRecipeFavorite,
}: {
  curRecipe: any;
  updateRecipeFavorite: (newFavoriteStatus: boolean) => void;
}) {
  ////local units are more important to convert to different units later
  const selectedOption = () => {
    const selectedOption = curRecipe?.ingredients.reduce(
      (acc: any, ing: any) => {
        if (ing.unit === "US cups") return "us";
        if (ing.unit === "Japanese cups") return "japan";
        if (ing.unit === "Imperial cups") return "metricCup";
        if (ing.unit === "Australian Tbsp") return "australia";

        if (acc !== "metric") return acc;

        return "metric";
      },
      "metric"
    );
    return selectedOption;
  };

  const [servingsValue, setServingsValue] = useState(
    curRecipe?.servings.servings
  );
  const [temperatureUnit, setTemperatureUnit] = useState(
    curRecipe?.temperatures.unit
  );
  const [ingredientsUnit, setIngredientsUnit] = useState(selectedOption());
  const [favorite, setFavorite] = useState(curRecipe?.favorite);
  const [curSlide, setCurSlide] = useState(0);
  const [maxSlide, setMaxSlide] = useState(curRecipe?.memoryImages.length - 1);

  useEffect(() => {
    setServingsValue(curRecipe?.servings.servings);
  }, [curRecipe?.servings.servings]);

  useEffect(() => {
    setTemperatureUnit(curRecipe?.temperatures.unit);
  }, [curRecipe?.temperatures.unit]);

  useEffect(() => {
    setIngredientsUnit(selectedOption());
  }, [selectedOption()]);

  useEffect(() => {
    setFavorite(curRecipe?.favorite);
  }, [curRecipe?.favorite]);

  useEffect(() => {
    setMaxSlide(curRecipe?.memoryImages.length - 1);
  }, [curRecipe?.memoryImages.length]);

  useEffect(() => {
    setCurSlide(0);
  }, [curRecipe?.memoryImages]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurSlide((prev) => (prev === maxSlide ? 0 : prev + 1));
    }, 5000);

    return () => {
      clearInterval(id);
    };
  }, []);

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);
  }

  function handleChangeIngUnit(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.currentTarget.value;
    setIngredientsUnit(newValue);
  }

  function handleChangeTempUnit(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.currentTarget.value;
    setTemperatureUnit(newValue);
  }

  function handleClickFavorite() {
    const newFavoriteStatus = !favorite;
    setFavorite(newFavoriteStatus);
    updateRecipeFavorite(newFavoriteStatus);
  }

  function handleClickDots(i: number) {
    setCurSlide(i);
  }

  const calcTransitionXSlider = (index: number) => {
    const translateX = (index - curSlide) * 100;
    return `translateX(${translateX}%)`;
  };

  return (
    <div className={styles.container__recipe}>
      {curRecipe ? (
        <>
          <img
            className={styles.img__main}
            src={curRecipe.mainImage || "/grey-img.png"}
            alt="main image"
          ></img>
          <div className={styles.title_wrapper}>
            <h2 className={styles.title}>{curRecipe.title}</h2>
          </div>
          <div className={styles.container__description_favorite}>
            <div className={styles.container__description}>
              <div className={styles.container__author_servings}>
                <p>Author</p>
                <span className={styles.author}>{curRecipe.author}</span>
                <p>Servings</p>
                <input
                  id={styles.input__servings}
                  type="number"
                  min="1"
                  max="500"
                  value={servingsValue}
                  onChange={handleChangeInput}
                />
                <span className={styles.servings_unit}>
                  {curRecipe.servings.unit}
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
                  {curRecipe.temperatures.temperatures.join("/")}
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
              {curRecipe.ingredients.map((ing: any) => (
                <div key={nanoid()} className={styles.ingredient_line}>
                  <input type="checkbox" />
                  <span>
                    {" "}
                    {ing.amount} {ing.unit} of {ing.ingredient}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.container__instructions}>
            <h2>~ Instructions ~</h2>
            {curRecipe.instructions.map((step: any, i: number) => (
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
            <p>{curRecipe.description}</p>
          </div>
          {curRecipe.memoryImages.length && (
            <div className={styles.container__slider}>
              <h2>~ Memories of the recipe ~</h2>
              <div className={styles.slider__imgs}>
                {curRecipe.memoryImages.map((img: string, i: number) => (
                  <img
                    src={img || "/grey-img.png"}
                    alt={`memory image${i + 1}`}
                    style={{
                      transform: calcTransitionXSlider(i),
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
                  {curRecipe.memoryImages.map((_: any, i: number) => (
                    <button
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
                {curRecipe.comments}
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
};

const Timer = function ({
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

      let nextMinutes: string;
      if (nextSeconds === "59") {
        if (!numberMinutes) nextMinutes = "59";
        if (numberMinutes)
          nextMinutes = (numberMinutes - 1).toString().padStart(2, "0");
      } else {
        nextMinutes = immediateTime.minutes;
      }

      let nextHours: string;
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
};

/////There is a bug when delete timer with fewer number they can not be deleted! Because I can't update index after spliced markupTimersArr I assume
const Timers = function () {
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
        console.log(deletedIndex, prev);
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
};

const Note = function () {
  return (
    <section className={styles.section__note} contentEditable="true">
      You can use this space for taking a note for cooking :)
    </section>
  );
};

export default function MAIN() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [curRecipe, setCurRecipe] = useState<any>(null);
  const searchRef = useRef(null);

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

  function handleClickPreview(recipe: any) {
    setCurRecipe(recipe);
  }

  function updateRecipeFavorite(newFavoriteStatus: boolean) {
    let recipe = recipes.find((recipe) => recipe.id === curRecipe?.id);
    if (!recipe) return;
    const newRecipe = { ...recipe };
    newRecipe.favorite = newFavoriteStatus;
    recipe = newRecipe;

    setCurRecipe(recipe);
    console.log(recipe);
  }

  return (
    <div
      className={clsx(styles.page__main)}
      onClick={handleCloseDropdownSearch}
    >
      <div className={styles.container__cooking}>
        <DropdownMenu
          isDropdownVisible={isDropdownVisible}
          onClickDropdown={handleToggleDropdown}
        />

        <section className={styles.section__recipe}>
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

        <section className={styles.section__timers_note}>
          <Timers />
          <Note />
        </section>
      </div>
    </div>
  );
}
