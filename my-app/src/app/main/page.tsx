"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { create } from "domain";

const createUniqueKey = () => {
  return Math.random() + Math.random() + Math.random();
};

//for dev
const recipes = [
  {
    id: createUniqueKey(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      { ingredient: "olives", amount: "1", unit: "can" },
      { ingredient: "flour", amount: "250", unit: "g" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      { ingredient: "strawberries", amount: "2", unit: "UScups" },
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "eggs", amount: "2 large", unit: "" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℃" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "water", amount: "1", unit: "L" },
      { ingredient: "salt", amount: "2", unit: "teaspoons" },
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
    id: createUniqueKey(),
    favorite: true,
    mainImage: "",
    title: "Delicious Granola!",
    author: "Lei-chan",
    servings: { servings: 12, unit: "people" },
    temperatures: { temperatures: [190, 175], unit: "℃" },
    ingredients: [
      { ingredient: "granola", amount: "250", unit: "g" },
      { ingredient: "water", amount: "1", unit: "L" },
      { ingredient: "salt", amount: "2", unit: "teaspoons" },
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
    comments: "hhh",
  },
  {
    id: createUniqueKey(),
    favorite: true,
    mainImage: "",
    title: "Banana Bread!",
    author: "Lei-chan",
    servings: { servings: 12, unit: "people" },
    temperatures: { temperatures: [200, 190], unit: "℃" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "water", amount: "1", unit: "L" },
      { ingredient: "salt", amount: "2", unit: "teaspoons" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "Chocolate Muffines!",
    author: "Lei-chan",
    servings: { servings: 20, unit: "cupcakes" },
    temperatures: { temperatures: [370], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "water", amount: "1", unit: "L" },
      { ingredient: "salt", amount: "2", unit: "teaspoons" },
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
    id: createUniqueKey(),
    favorite: true,
    mainImage: "",
    title: "Scones",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℃" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "sugar", amount: "1", unit: "Tbsp" },
      { ingredient: "butter", amount: "50", unit: "g" },
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
    id: createUniqueKey(),
    favorite: true,
    mainImage: "",
    title: "Salad!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℃" },
    ingredients: [
      { ingredient: "Baby spinach", amount: "1", unit: "UScups" },
      { ingredient: "olive oil", amount: "1/4", unit: "UScups" },
      { ingredient: "salt", amount: "1", unit: "teaspoons" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "brawnies!",
    author: "Lei-chan",
    servings: { servings: 12, unit: "tiny pieces" },
    temperatures: { temperatures: [375], unit: "℉" },
    ingredients: [
      { ingredient: "chocolate", amount: "250", unit: "g" },
      { ingredient: "All-purpose flour", amount: "2.5", unit: "UScups" },
      { ingredient: "salt", amount: "a pinch of", unit: "" },
      { ingredient: "eggs", amount: "2 large", unit: "" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "Stir fry!",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      { ingredient: "Cabbage", amount: "halve", unit: "" },
      { ingredient: "water", amount: "30", unit: "ml" },
      { ingredient: "soy sauce", amount: "2", unit: "teaspoons" },
      { ingredient: "mirin", amount: "2", unit: "teaspoons" },
      { ingredient: "sake", amount: "2", unit: "teaspoons" },
    ],
    instructions: [
      {
        instruction: "First put eggs in a bowl and mix with sugar.",
        image: "",
      },
      { instruction: "Add soy milk and set it aside.", image: "" },
      { instruction: "Add soy milk and set it aside.", image: "" },
      { instruction: "Add soy milk and set it aside.", image: "" },
    ],
    description: "This is our family's favorite recipe!",
    memoryImages: ["", ""],
    comments: "",
  },
  {
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "Coffee bagles!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [220], unit: "℃" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "water", amount: "180", unit: "g" },
      { ingredient: "instant coffee", amount: "2", unit: "tablespoons" },
      { ingredient: "salt", amount: "a pinch of", unit: "" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "loaf bread!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [250, 230], unit: "℃" },
    ingredients: [
      { ingredient: "flour", amount: "250", unit: "g" },
      { ingredient: "water", amount: "200", unit: "g" },
      { ingredient: "salt", amount: "5", unit: "g" },
      { ingredient: "butter", amount: "10", unit: "g" },
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
    id: createUniqueKey(),
    favorite: false,
    mainImage: "",
    title: "Best Egg Sandwiches!",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      { ingredient: "cut bread", amount: "8", unit: "slices" },
      { ingredient: "eggs", amount: "4", unit: "" },
      { ingredient: "salt", amount: "a little", unit: "" },
      { ingredient: "blackpepper", amount: "a little", unit: "" },
      {
        ingredient: "nutritional yeast",
        amount: "as much as you want",
        unit: "",
      },
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
  isDropdownVisible: Boolean;
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
  isSearchVisible: Boolean;
  searchRef: any;
  onClickSearch: () => void;
  onClickPreview: (recipe: {
    id: number; //for now
    favorite: Boolean;
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
}: {
  curRecipe: {
    id: number; //for now
    favorite: Boolean;
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
  } | null;
}) {
  const selectedOption = () => {
    const selectedOption = curRecipe?.ingredients.reduce(
      (acc: any, ing: any) => {
        if (ing.unit === "cupUS") return "us";
        if (ing.unit === "cupJapan") return "japan";
        if (ing.unit === "cupImperial") return "metricCup";
        if (ing.unit === "TbspAustralia") return "australia";

        return "metric";
      },
      "metric"
    );
    return selectedOption;
  };

  ////input defaultvalue doesn't change when re-rendering!
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
                  defaultValue={curRecipe.servings.servings}
                />
                <span className={styles.servings_unit}>
                  {curRecipe.servings.unit}
                </span>
              </div>
              <div className={styles.container__ingredients_unit}>
                <p>Ingredients Unit</p>
                <select
                  id={styles.input__ingredients_unit}
                  defaultValue={selectedOption()}
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
                  defaultValue={curRecipe.temperatures.unit}
                >
                  <option value="℃">℃</option>
                  <option value="℉">℉</option>
                </select>
              </div>
            </div>
            <button
              className={clsx(
                styles.btn__favorite,
                curRecipe.favorite && styles.btn__favorite_on
              )}
            ></button>
          </div>
          <div className={styles.container__ingredients}>
            <h3>~ Ingredients ~</h3>
            <div className={styles.ingredients}>
              {curRecipe.ingredients.map((ing) => (
                <div className={styles.ingredient_line}>
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
            {curRecipe.instructions.map((step, i) => (
              <div className={styles.step}>
                <div className={styles.container__step_step_img}>
                  <p>
                    <span>{i + 1}</span> {step.instruction}
                  </p>
                  {step.image && (
                    <img src={step.image} alt={`step ${i + 1} image`}></img>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.container__recipe_description}>
            <h2>~ About this recipe ~</h2>
            <p>{curRecipe.description}</p>
          </div>
          <div className={styles.container__slider}>
            <h2>~ Memories of the recipe ~</h2>
            <div className={styles.slider__imgs}>
              {curRecipe.memoryImages.map((img, i) => (
                <img src={img} alt={`memory image${i + 1}`}></img>
              ))}
            </div>
          </div>

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
      key={createUniqueKey()}
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
  const [curRecipe, setCurRecipe] = useState<{
    id: number; //for now
    favorite: Boolean;
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
  } | null>(null);
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

  function handleClickPreview(recipe: {
    id: number; //for now
    favorite: Boolean;
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
  }) {
    setCurRecipe(recipe);
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
          <Recipe curRecipe={curRecipe} />
        </section>

        <section className={styles.section__timers_note}>
          <Timers />
          <Note />
        </section>
      </div>
    </div>
  );
}
