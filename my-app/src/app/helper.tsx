import { nanoid } from "nanoid";
import { TYPE_RECIPE, PASSWORD_REGEX } from "./config";

export const getData = async (path: string, option: object) => {
  try {
    const res = await fetch(path, option);
    const data = await res.json();

    if (!res.ok) {
      const err: any = new Error(data.error);
      err.statusCode = res.status;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const validatePassword = (input: string) => {
  const passwordRegex = PASSWORD_REGEX;

  return passwordRegex.test(input);
};

export const calcNumberOfPages = (recipes: Object[], recipesPerPage: number) =>
  Math.ceil(recipes.length / recipesPerPage);

export const getFilteredRecipes = (value: string) => {
  const structuredValue = value.trim().toLowerCase();
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLocaleLowerCase().includes(structuredValue) ||
      recipe.ingredients.find((ing) =>
        ing.ingredient.toLowerCase().includes(structuredValue)
      )
  );
  return filteredRecipes;
};

export const getRecipesPerPage = (
  filteredRecipes: TYPE_RECIPE[],
  numberRecipesPerPage: number,
  curPage: number
) => {
  const startIndex = (curPage - 1) * numberRecipesPerPage;
  const endIndex = startIndex + numberRecipesPerPage;
  const recipesPerPage = filteredRecipes.slice(startIndex, endIndex);

  return recipesPerPage ? recipesPerPage : null;
};

export const calcTransitionXSlider = (index: number, curSlide: number) => {
  const translateX = (index - curSlide) * 100;
  return `translateX(${translateX}%)`;
};

export const getImageURL = (file: any) => {
  console.log(file);
  return file?.name ? URL.createObjectURL(file) : "";
};

////local units are more important to convert to different units later
export const getRegion = (ingredients: any) => {
  const servingsUnit = ingredients.reduce((acc: any, ing: any) => {
    if (ing.unit === "US cup") return "us";
    if (ing.unit === "Japanese cup") return "japan";
    if (ing.unit === "Imperial cup") return "metricCup";
    if (ing.unit === "Australian Tbsp") return "australia";

    if (acc !== "metric") return acc;

    return "metric";
  }, "metric");
  return servingsUnit;
};

export const getReadableIngUnit = (unit: string, customUnit: string = "") => {
  let readableUnit;
  if (unit === "cupUS") readableUnit = "US cup";
  else if (unit === "cupJapan") readableUnit = "Japanese cup";
  else if (unit === "cupImperial") readableUnit = "Imperial cup";
  else if (unit === "riceCup") readableUnit = "rice cup";
  else if (unit === "TbspAustralia") readableUnit = "Australian Tbsp";
  else if (unit === "other") readableUnit = customUnit;
  else if (unit === "noUnit") readableUnit = "";
  else readableUnit = unit;

  console.log(readableUnit);
  return readableUnit;
};

export const updateIngsForServings = (
  servings: number,
  recipe: TYPE_RECIPE
) => {
  const newIngs = recipe.ingredients.map(
    (ing: {
      ingredient: string;
      amount: number | string;
      unit: string;
      id: number;
    }) => {
      ///calclate ing for one serivng first then multiply it by new servings
      const newAmount =
        typeof ing.amount === "string"
          ? `${(1 / recipe.servings.servings) * servings} ${ing.amount}`
          : +((ing.amount / recipe.servings.servings) * servings).toFixed(1);

      const newIng = { ...ing };
      newIng.amount = newAmount;
      return newIng;
    }
  );

  return newIngs; //array of updated ingredients for new servings
};

//success!
export const getNutritionData = async function (
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
      const err: any = new Error(data.message);
      err.statusCode = res.status;
      throw err;
    }

    console.log(data);
  } catch (err) {
    console.error(err);
  }
};
//success!!
export const getSuggestion = async function (foodName: string) {
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
      const err: any = new Error(data.message);
      err.statusCode = res.status;
      throw err;
    }

    console.log(data);
  } catch (err) {
    console.error(err);
  }
};

export const convertTempUnits = function (
  value: number,
  optionFrom: "℉" | "F" | "f" | "℃" | "C" | "c"
) {
  let result;

  if (optionFrom === "℉" || optionFrom.toLowerCase() === "f")
    result = (value - 32) * (5 / 9);

  if (optionFrom === "℃" || optionFrom.toLowerCase() === "c")
    result = value * (9 / 5) + 32;

  return result ? +result.toFixed(1) : 0;
};

// prettier-ignore
export const convertIngUnits = function(
  amount: number,
  unitFrom: "g" | "kg" | "oz" | "lb" | "ml" | "L" | "USCup" | "JapaneseCup" | "ImperialCup" | "riceCup" | "tsp" | "Tbsp" | "AustralianTbsp" | "other"
) {
  ///for main page toFixed(1)
  let metric;
  let us;
  let japan;
  let australia;
  let metricCup;

  ///For converter page toFixed(3)
  let g;
  let kg;
  let oz; 
  let lb;
  let ml;
  let L;
  let USCup;
  let JapaneseCup;
  let ImperialCup;
  let riceCup;
  let tsp;
  let Tbsp;
  let AustralianTbsp;

  if (unitFrom === "g") {
    metric = {amount, unit: unitFrom};
    us = { amount: +(amount / 28.3495).toFixed(1), unit: "oz" };
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = metric;
    oz = {amount: +(amount / 28.3495).toFixed(3), unit: "oz" };
}

  if (unitFrom === "kg") {
    metric = {amount, unit: unitFrom};
    us = { amount: +(amount * 2.20462).toFixed(1), unit: "lb" };
    japan = metric
    metricCup = metric
    australia = metric
    g = {amount: +(amount * 1000).toFixed(3), unit: 'g'};
    oz = {amount: +(amount * 35.274).toFixed(3), unit: 'oz'};
}


  if (unitFrom === "oz"){
    metric = { amount: +(amount * 28.3495).toFixed(1), unit: "g" };
    us = {amount, unit: unitFrom};
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = { amount: +(amount * 28.3495).toFixed(3), unit: "g" };
    oz = us;
}

  if (unitFrom === "lb"){
    metric = { amount: +(amount / 35.274).toFixed(1), unit: "kg" };
    us = {amount, unit: unitFrom};
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = {amount: +(amount * 453.592).toFixed(3), unit: 'g'};
    oz = {amount: +(amount * 16).toFixed(3), unit: 'oz'};
}

if (unitFrom === "ml") {
  metric = {amount, unit: unitFrom};
  us = { amount: +(amount / 240).toFixed(1), unit: "US cup" };
  japan = { amount: +(amount / 200).toFixed(1), unit: "Japanese cup" };
  metricCup = { amount: +(amount / 250).toFixed(1), unit: "Imperial cup" };
  australia = metricCup;
  ml = {amount, unit: unitFrom};
  }

  if (unitFrom === "L") {
    metric = {amount, unit: unitFrom};
    us = { amount: +(amount * 4.167).toFixed(1), unit: "US cup" };
    japan = { amount: +(amount * 5).toFixed(1), unit: "Japanese cup" };
    metricCup = { amount: +(amount * 4).toFixed(1), unit: "Imperial cup" };
    australia = metricCup;
    ml = {amount: +(amount * 1000).toFixed(3), unit: 'ml'};
  }

  if (unitFrom === "USCup") {
    metric = { amount: +(amount * 240).toFixed(1), unit: "ml" };
    us = {amount, unit: 'US cup'};
    japan = {
      cupJapan: { amount: +(amount * 1.2).toFixed(1), unit: "Japanese cup" },
      riceCup: { amount: +(amount * 1.3333).toFixed(1), unit: "rice cup" }
    };
    metricCup = { amount: +(amount * 0.96).toFixed(1), unit: "Imperial cup" };
    australia = metricCup;
    ml = {amount: +(amount * 240).toFixed(3), unit: 'ml'};
  }

  if (unitFrom === "JapaneseCup") {
    metric = { amount: +(amount * 200).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 0.833).toFixed(1), unit: "US cup" };
    japan = {amount, unit: 'Japanese cup'};
    metricCup = { amount: +(amount * 0.8).toFixed(1), unit: "Imperial cup" };
    australia = metricCup;
    ml = {amount: +(amount * 200).toFixed(3), unit: 'ml'};
  }

  if (unitFrom === "ImperialCup") {
    metric = { amount: +(amount * 250).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 1.041).toFixed(1), unit: "US cup" };
    japan = { amount: +(amount * 1.25).toFixed(1), unit: "Japanese cup" };
    metricCup = {amount, unit: 'Imperial cup'};
    australia = metricCup;
    ml = {amount: +(amount * 250).toFixed(3), unit: 'ml'};
  }

  if (unitFrom === "riceCup") {
    metric = { amount: +(amount * 180).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 0.75).toFixed(1), unit: "US cup" };
    japan = { amount: +(amount * 0.9).toFixed(1), unit: "Japanese cup" };
    metricCup = { amount: +(amount * 0.72).toFixed(1), unit: "Imperial cup" };
    australia = metricCup;
    ml = {amount: +(amount * 180).toFixed(3), unit: 'ml'};
  }

  if (unitFrom === "tsp"){ 
    metric = { amount: +(amount * 5).toFixed(1), unit: "ml" };
    us = {amount, unit: unitFrom};
    japan = us;
    metricCup = us;
    australia = us;
    ml = {amount: +(amount * 5).toFixed(3), unit: 'ml'};
}

  if (unitFrom === "Tbsp") {
    metric = { amount: +(amount * 15).toFixed(1), unit: "ml" };
    us = {amount, unit: unitFrom};
    japan = us;
    metricCup = us;
    australia = { amount: +(amount * 0.75).toFixed(1), unit: "Australian Tbsp" };
    ml = {amount: +(amount * 15).toFixed(3), unit: 'ml'};
  }

  if (unitFrom === "AustralianTbsp") {
    metric = { amount: +(amount * 20).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 1.3333).toFixed(1), unit: "Tbsp" };
    japan = us;
    metricCup = us;
    australia = {amount, unit: 'Australian Tbsp'};
    ml = {amount: +(amount * 20).toFixed(3), unit: 'ml'};
  }

  kg = g && {amount: +(g.amount / 1000).toFixed(3), unit: 'kg'};
  lb = oz && {amount: +(oz.amount / 16).toFixed(3), unit: 'lb'};
  L = ml && {amount: +(ml.amount / 1000).toFixed(3), unit: 'L'};
  USCup = ml &&  {amount: +(ml.amount / 240).toFixed(3), unit: 'US cup'};
  JapaneseCup = ml && {amount: +(ml.amount / 200).toFixed(3), unit: 'Japanese cup'};
  ImperialCup = ml && {amount: +(ml.amount / 250).toFixed(3), unit: 'Imperial cup'};
  riceCup = ml && {amount: +(ml.amount / 180).toFixed(3), unit: 'rice cup'};
  tsp = ml && {amount: +(ml.amount / 5).toFixed(3), unit: 'tsp'};
  Tbsp = ml && {amount: +(ml.amount / 15).toFixed(3), unit: 'Tbsp'};
  AustralianTbsp = ml && {amount: +(ml.amount / 20).toFixed(3), unit: 'Australian Tbsp'};

  return {
    metric: metric || "",
    us: us || "",
    japan: japan || "",
    australia: australia || "",
    metricCup: metricCup || "",
    g: g || '',
    kg: kg || '', 
    oz: oz || '',
    lb: lb || '',
    ml: ml || '', 
    L: L || '', 
    USCup: USCup || '', 
    JapaneseCup: JapaneseCup || '', 
    ImperialCup: ImperialCup || '', 
    riceCup: riceCup || '', 
    tsp: tsp || '', 
    Tbsp: Tbsp || '', 
    AustralianTbsp: AustralianTbsp || '',
  };
};

export const convertLengthUnits = function (
  length: number,
  unitFrom: "mm" | "cm" | "m" | "inch" | "foot" | "yard"
) {
  let mm;
  let cm;
  let m;
  let inch;
  let foot;
  let yard;

  if (unitFrom === "mm") {
    mm = { length, unit: unitFrom };
    inch = { length: +(length / 25.4).toFixed(3), unit: "inch" };
  }

  if (unitFrom === "cm") {
    mm = { length: length * 10, unit: "mm" };
    inch = { length: +(length / 2.54).toFixed(3), unit: "inch" };
  }

  if (unitFrom === "m") {
    mm = { length: length * 1000, unit: "mm" };
    inch = { length: +(length * 39.37).toFixed(3), unit: "inch" };
  }

  if (unitFrom === "inch") {
    mm = { length: +(length * 25.4).toFixed(3), unit: "mm" };
    inch = { length, unit: unitFrom };
  }

  if (unitFrom === "foot") {
    mm = { length: +(length * 304.8).toFixed(3), unit: "mm" };
    inch = { length: length * 12, unit: "inch" };
  }

  if (unitFrom === "yard") {
    mm = { length: +(length * 914.4).toFixed(3), unit: "mm" };
    inch = { length: length * 36, unit: "inch" };
  }

  cm = mm && { length: +(mm.length / 10).toFixed(3), unit: "cm" };
  m = cm && { length: +(cm.length / 100).toFixed(3), unit: "m" };
  foot = inch && { length: +(inch.length / 12).toFixed(3), unit: "foot" };
  yard = foot && { length: +(foot.length / 3).toFixed(3), unit: "yard" };

  return { mm, cm, m, inch, foot, yard };
};

//for dev from here!
//convertion : {} for now
//calc and set it when users create or edit recipes later
const originalRecipes = [
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: "jsjksjsieo388",
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [190, 180], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "JapaneseCup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "JapaneseCup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "",
        unit: "a pinch",
        id: 9226,
        convertion: {},
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
    memoryImages: [],
    comments: "",
  },
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "My Favorite Foccacia!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "olives",
        amount: 1.5,
        unit: "can",
        convertion: {},
        id: 9226,
      },
      {
        ingredient: "flour",
        amount: 250.5,
        unit: "g",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Strawberry Pancakes",
    author: "Lei-chan",
    servings: { servings: 4, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "strawberries",
        amount: 2,
        unit: "US cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "flour",
        amount: 250,
        unit: "oz",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "large eggs",
        amount: 2.5,
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "My Pizza!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [300], unit: "℉" },
    ingredients: [
      { ingredient: "flour", amount: 250, unit: "g", id: 9226, convertion: {} },
      { ingredient: "water", amount: 1, unit: "L", id: 9226, convertion: {} },
      {
        ingredient: "salt",
        amount: 1.5,
        unit: "tsp",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: true,
    mainImage: "",
    title: "Amazing Donuts!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "pieces" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Rice flour",
        amount: 2,
        unit: "Japanese cup",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Soy milk",
        amount: 1,
        unit: "Japanese cup",
        id: 3949,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: "a pinch",
        unit: "",
        id: 9226,
        convertion: {},
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
  {
    id: nanoid(),
    favorite: false,
    mainImage: "",
    title: "Amazing Hummus!",
    author: "Lei-chan",
    servings: { servings: 8, unit: "people" },
    temperatures: { temperatures: [], unit: "℃" },
    ingredients: [
      {
        ingredient: "Chick peas",
        amount: 2,
        unit: "can",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "Garlic cloves",
        amount: 2,
        unit: "",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "salt",
        amount: 1,
        unit: "tsp",
        id: 9226,
        convertion: {},
      },
      {
        ingredient: "olive oil",
        amount: 0.5,
        unit: "US cup",
        id: 9226,
        convertion: {},
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

export const getTotalNumberOfRecipes = function () {
  return originalRecipes.length;
};

//returns recipe with updated convertion
export const updateConvertion = function (recipe: TYPE_RECIPE) {
  const newRecipe = { ...recipe };
  const newIngs = recipe.ingredients.map((ing: any) => {
    const newIng = { ...ing };
    if (typeof ing.amount === "number")
      newIng.convertion = convertIngUnits(ing.amount, ing.unit);
    return newIng;
  });

  newRecipe.ingredients = newIngs;
  return newRecipe;
};

///sort recipes by alphabetical order and favorite order
export const recipes = [...originalRecipes]
  .sort((a: any, b: any) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;

    return 0;
  })
  .sort((a: any, b: any) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;

    return 0;
  })
  .map((recipe: any) => updateConvertion(recipe))
  .map((recipe) => {
    return { ...recipe, region: getRegion(recipe.ingredients) };
  });
