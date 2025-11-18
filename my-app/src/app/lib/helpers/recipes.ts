//type
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  TYPE_LANGUAGE,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_RECIPE_LINK,
  TYPE_REGION_UNIT,
  TYPE_SERVINGS_UNIT,
  TYPE_USER_CONTEXT,
  TYPE_USER_RECIPE,
  TYPE_USER_RECIPE_DATABASE,
  TYPE_USER_RECIPE_LINK,
  TYPE_USER_RECIPE_LINK_DATABASE,
} from "../config/type";
//methods for convertion
import { convertIngUnits, convertTempUnits } from "./converter";
//general methods
import { getData } from "./other";

export const handleClickEdit = (router: AppRouterInstance) => {
  const id = window.location.hash.slice(1);
  if (!id) return;

  router.push(`/recipes/${id}`);
};

//create recipe
export const uploadRecipeCreate = async (
  recipe: TYPE_RECIPE | TYPE_RECIPE_LINK,
  userContext: TYPE_USER_CONTEXT
) => {
  try {
    ///store new recipe in recipes database and user info database
    const recipeData = await getData(
      `/api/recipes${"link" in recipe ? "/link" : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      }
    );

    recipeData.newAccessToken && userContext?.login(recipeData.newAccessToken);

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
};

//update recipe
export const uploadRecipeUpdate = async (
  recipe: TYPE_RECIPE | TYPE_RECIPE_LINK,
  userContext: TYPE_USER_CONTEXT
) => {
  try {
    //remove _id to avoid trying to update immutable field
    const { _id, ...others } = recipe;

    ///store new recipe in recipes database and user info database
    const recipeData = await getData(
      `/api/recipes${"link" in recipe ? "/link" : ""}?id=${_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(others),
      }
    );
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

//brief explanation
//translation
export const getTranslatedServingsUnit = (
  language: TYPE_LANGUAGE,
  unit: TYPE_SERVINGS_UNIT
) => {
  if (language === "ja") {
    if (unit === "people") return "人分";
    if (unit === "slices") return "スライス";
    if (unit === "pieces") return "個分";
    if (unit === "cups") return "カップ";
    if (unit === "bowls") return "杯分";
    if (unit === "other") return "その他";
  }

  return unit;
};

export const getTranslatedIngredientsUnit = (
  language: TYPE_LANGUAGE,
  unit: string
) => {
  if (language === "ja") {
    if (unit === "usCup") return "カップ（アメリカ）";
    if (unit === "japaneseCup") return "カップ（日本）";
    if (unit === "imperialCup") return "メトリックカップ (1カップ = 250ml)";
    if (unit === "riceCup") return "合";
    if (unit === "tsp") return "小さじ";
    if (unit === "tbsp") return "大さじ";
    if (unit === "australianTbsp") return "大さじ（オーストラリア）";
    if (unit === "pinch") return "つまみ";
    if (unit === "can") return "缶";
    if (unit === "slice") return "スライス";
    if (unit === "other") return "その他";
    if (unit === "noUnit") return "単位なし";
  }

  if (language === "en") {
    if (unit === "usCup") return "US cup";
    if (unit === "japaneseCup") return "Japanese cup";
    if (unit === "imperialCup") return "Imperial cup";
    if (unit === "riceCup") return "rice cup";
    if (unit === "australianTbsp") return "Australian tbsp";
  }

  return unit;
};

//returns recipe with updated convertion
export const updateConvertion = (recipe: TYPE_RECIPE) => {
  const newRecipe = { ...recipe };
  const newIngs = recipe.ingredients.map((ing: TYPE_INGREDIENT) => {
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

export const getImageFileData = (file: File, uri: string) => {
  return {
    data: uri,
    contentType: "WEBP",
    filename: file.name,
    fileSize: file.size,
  };
};

//recipes page
export const getUserRecipes = async (
  accessToken: string | undefined,
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
  filteredRecipes: (
    | TYPE_RECIPE
    | TYPE_RECIPE_LINK
    | TYPE_USER_RECIPE
    | TYPE_USER_RECIPE_LINK
  )[],
  numberRecipesPerPage: number,
  curPage: number
) => {
  const startIndex = (curPage - 1) * numberRecipesPerPage;
  const endIndex = startIndex + numberRecipesPerPage;
  const recipesPerPage = filteredRecipes.slice(startIndex, endIndex);

  return recipesPerPage ? recipesPerPage : [];
};

export const getOrderedRecipes = (
  recipes: (TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE)[] | []
) =>
  recipes
    .toSorted(
      (
        a: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE,
        b: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
      ) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;

        return 0;
      }
    )
    .toSorted(
      (
        a: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE,
        b: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
      ) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;

        return 0;
      }
    );

export const createMessage = (
  language: TYPE_LANGUAGE,
  error: string,
  isPending: boolean,
  numberOfRecipes: number | null,
  recipeLength: number
) => {
  if (error) return error;

  if (isPending)
    return language === "ja" ? "レシピをロード中…" : "Loading your recipes...";

  if (numberOfRecipes === 0)
    return language === "ja"
      ? "まだレシピが作られていません。レシピを作ってwithCookingを始めましょう！"
      : "No recipes created yet. Let't start by creating a recipe :)";

  if (!recipeLength)
    return language === "ja"
      ? "レシピが見つかりませんでした。別のキーワードで検索してください"
      : "No recipes found. Please try again with a different keyword :)";

  return "";
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
