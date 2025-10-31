import {
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
} from "../config/type";
import { convertIngUnits, convertTempUnits } from "./converter";
import { getData } from "./other";

//upload recipe
export const uploadRecipeUpdate = async (
  recipe: TYPE_RECIPE,
  userContext: any
) => {
  try {
    //remove _id to avoid trying to update immutable field
    const { _id, ...others } = recipe;

    ///store new recipe in recipes database and user info database
    const recipeData = await getData(`/api/recipes?id=${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(others),
    });
    recipeData.newAccessToken && userContext?.login(recipeData.newAccessToken);

    //connect the recipe data id to user recipe data id
    const userData = await getData("/api/users/recipes", {
      method: "PUT",
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
};

export const isRecipeAllowed = (recipe: TYPE_RECIPE) =>
  !recipe.mainImage &&
  !recipe.title &&
  !recipe.author &&
  !recipe.servings.servings &&
  !recipe.ingredients.length &&
  !recipe.temperatures.temperatures.length &&
  !recipe.preparation &&
  !recipe.instructions.length &&
  !recipe.description &&
  !recipe.memoryImages.length &&
  !recipe.comments
    ? false
    : true;

// ////local units are more important to convert to different units later
// export const getRegion = (ingredients: any) => {
//   const servingsUnit = ingredients.reduce((acc: any, ing: any) => {
//     if (ing.unit === "US cup") return "us";
//     if (ing.unit === "Japanese cup") return "japan";
//     if (ing.unit === "Imperial cup") return "metricCup";
//     if (ing.unit === "Australian Tbsp") return "australia";

//     if (acc !== "metric") return acc;

//     return "metric";
//   }, "metric");
//   return servingsUnit;
// };

//brief explanation
//returns recipe with updated convertion
export const updateConvertion = (recipe: TYPE_RECIPE) => {
  const newRecipe = { ...recipe };
  const newIngs = recipe.ingredients.map((ing: any) => {
    const newIng = { ...ing };
    newIng.convertion = convertIngUnits(ing.amount, ing.unit);
    return newIng;
  });

  newRecipe.ingredients = newIngs;
  return newRecipe;
};

export const getTemperatures = (
  temperatures: number[],
  originalUnit: "℉" | "℃",
  newUnit: "℉" | "℃"
) => {
  const newTemps =
    originalUnit === newUnit
      ? temperatures
      : temperatures.map((temp) => convertTempUnits(temp, originalUnit));

  return newTemps.join(" / ");
};

//ingredients
export const getIngGridTemplateColumnsStyle = (
  ingredients: TYPE_INGREDIENTS,
  regionUnit: TYPE_REGION_UNIT,
  mediaContext: TYPE_MEDIA,
  edit: boolean
) => {
  const isLongIngName = ingredients
    .map((ing: TYPE_INGREDIENT) => ing.ingredient)
    .some((name: string) => name.length >= 8);

  const isLongAmount = ingredients
    .map((ing: TYPE_INGREDIENT) => ing.amount)
    .some((amount: number) => String(amount).length >= 5);

  const isLongIngUnit = ingredients
    .map((ing: TYPE_INGREDIENT) => ing.unit)
    .some((unit: string) => unit.length >= 6);

  return isLongIngName ||
    isLongAmount ||
    isLongIngUnit ||
    regionUnit === "japan" ||
    regionUnit === "metricCup" ||
    regionUnit === "australia" ||
    mediaContext === "mobile" ||
    edit
    ? "auto"
    : "auto auto";
};

export const getReadableIngUnit = (unit: string) => {
  let readableUnit;

  if (unit === "usCup") readableUnit = "US cup";
  else if (unit === "japaneseCup") readableUnit = "Japanese cup";
  else if (unit === "imperialCup") readableUnit = "Imperial cup";
  else if (unit === "riceCup") readableUnit = "rice cup";
  else if (unit === "australianTbsp") readableUnit = "Australian tbsp";
  else if (unit === "noUnit") readableUnit = "";
  else readableUnit = unit;

  return readableUnit;
};

export const updateIngsForServings = (
  servings: number,
  recipe: TYPE_RECIPE
) => {
  const newIngs = recipe.ingredients.map((ing: TYPE_INGREDIENT) => {
    if (!ing || !ing?.amount) return ing;

    ///calclate ing for one serivng first then multiply it by new servings
    const newAmount = +(
      (ing.amount / recipe.servings.servings) *
      servings
    ).toFixed(1);
    // typeof ing?.amount === "string"
    //   ? `${(1 / recipe.servings.servings) * servings} ${ing.amount}`

    const newIng = { ...ing };
    newIng.amount = newAmount;
    return newIng;
  });

  //array of updated ingredients for new servings
  return newIngs;
};

//slider
export const getNextSlideIndex = (curSlide: number, maxSlideIndex: number) => {
  return curSlide === maxSlideIndex ? 0 : curSlide + 1;
};

export const calcTransitionXSlider = (index: number, curSlide: number) => {
  const translateX = (index - curSlide) * 100;
  return `translateX(${translateX}%)`;
};

export const getImageFileData = (file: File, uri: any) => {
  return {
    data: uri,
    contentType: "WEBP",
    filename: file.name,
    fileSize: file.size,
  };
};

//nutrition data
// //success!
// export const getNutritionData = async function (
//   id: number,
//   amount: number | string,
//   unit: string
// ) {
//   try {
//     const res = await fetch(
//       `https://api.spoonacular.com/food/ingredients/${id}/information?amount=${amount}&unit=${unit}&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       const err: any = new Error(data.message);
//       err.statusCode = res.status;
//       throw err;
//     }

//     console.log(data);
//   } catch (err) {
//     console.error(err);
//   }
// };
// //success!!
// export const getSuggestion = async function (foodName: string) {
//   try {
//     const res = await fetch(
//       `https://api.spoonacular.com/food/ingredients/autocomplete?query=${foodName}&number=20&language=en&metaInformation=true&apiKey=${process.env.NEXT_PUBLIC_API_KEY}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       const err: any = new Error(data.message);
//       err.statusCode = res.status;
//       throw err;
//     }

//     console.log(data);
//   } catch (err) {
//     console.error(err);
//   }
// };

//recipes page
export const getUserRecipes = async (
  accessToken: any,
  startIndex: number,
  recipesPerRequest: number,
  keyword: string = ""
) => {
  try {
    const data = await getData(
      `/api/users/recipes?startIndex=${startIndex}&endIndex=${
        startIndex + recipesPerRequest
      }${keyword ? `&keyword=${keyword}` : ""}`,
      {
        method: "GET",
        headers: { authorization: `Bearer ${accessToken}` },
      }
    );

    return data;
  } catch (err) {
    throw err;
  }
};

export const calcNumberOfPages = (
  recipeLength: number,
  recipesPerPage: number
) => Math.ceil(recipeLength / recipesPerPage);

export const getRecipesPerPage = (
  filteredRecipes: TYPE_RECIPE[],
  numberRecipesPerPage: number,
  curPage: number
) => {
  const startIndex = (curPage - 1) * numberRecipesPerPage;
  const endIndex = startIndex + numberRecipesPerPage;
  const recipesPerPage = filteredRecipes.slice(startIndex, endIndex);

  return recipesPerPage ? recipesPerPage : [];
};

// export const getFilteredRecipes = (recipes: any[] | [], value: string) => {
//   const structuredValue = value.trim().toLowerCase();
//   const filteredRecipes = recipes.filter(
//     (recipe: any) =>
//       recipe.title.toLocaleLowerCase().includes(structuredValue) ||
//       recipe.ingredients.find((ing: TYPE_INGREDIENT) =>
//         ing.ingredient.toLowerCase().includes(structuredValue)
//       )
//   );
//   return filteredRecipes;
// };

export const getOrderedRecipes = (recipes: any[]) =>
  recipes
    .toSorted((a: any, b: any) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();

      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;

      return 0;
    })
    .toSorted((a: any, b: any) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;

      return 0;
    });

export const createMessage = (
  error: string,
  isPending: boolean,
  numberOfUserRecipes: number | null,
  numberOfCurPageRecipes: number
) => {
  if (error) return error;

  if (isPending) return "Loading your recipes...";

  if (numberOfUserRecipes === 0)
    return "No recipes created yet. Let't start by creating a recipe :)";

  if (!numberOfCurPageRecipes)
    return "No recipes found. Please try again with a different keyword :)";

  //otherwise no message
  return "";
};
