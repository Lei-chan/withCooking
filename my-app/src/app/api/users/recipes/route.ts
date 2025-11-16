//next.js
import { NextRequest, NextResponse } from "next/server";
//database
import connectDB from "@/app/lib/mongoDB";
import { getGridFSBucket } from "@/app/lib/mongoDB";
//schema
import User from "@/app/lib/modelSchemas/User";
//type
import {
  MyError,
  TYPE_INGREDIENT,
  TYPE_USER_RECIPE_DATABASE,
  TYPE_USER_RECIPE_LINK_DATABASE,
} from "@/app/lib/config/type";
//method for file downloading
import { downloadFile, returnNonApiErrorResponse } from "@/app/lib/helpers/api";
//methods for authentication
import { refreshAccessToken, authenticateToken } from "@/app/lib/auth";
//methods for recipes
import { getOrderedRecipes } from "@/app/lib/helpers/recipes";
//method for api
import { convertRecipeToUserRecipe } from "@/app/lib/helpers/api";
//general method
import { isApiError } from "@/app/lib/helpers/other";

//_id in Recipe is recipeId in User recipes

//get recipes in user data
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const bucket = getGridFSBucket();

    const searchParams = req.nextUrl.searchParams;
    const startIndex = searchParams.get("startIndex");
    const endIndex = searchParams.get("endIndex");
    const keyword = searchParams.get("keyword");

    if (!startIndex || !endIndex) {
      const err = new Error("startIndex and endIndex are required") as MyError;
      err.statusCode = 500;
      throw err;
    }

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);
    const recipes = user.recipes
      ? getOrderedRecipes(user.toObject().recipes)
      : [];

    const filteredRecipes =
      keyword && recipes.length
        ? recipes.filter(
            (
              recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
            ) => {
              const structuredKeyword = keyword.trim().toLowerCase();

              return (
                recipe.title.toLowerCase().includes(structuredKeyword) ||
                ("ingredients" in recipe &&
                  recipe.ingredients.length &&
                  recipe.ingredients.find((ing: TYPE_INGREDIENT) =>
                    ing.ingredient.toLowerCase().includes(structuredKeyword)
                  ))
              );
            }
          )
        : recipes;

    const slicedRecipes = filteredRecipes.slice(
      parseInt(startIndex),
      parseInt(endIndex)
    );

    const mainImagePreviews = slicedRecipes.length
      ? await Promise.all(
          slicedRecipes.map(
            (
              recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
            ) =>
              "mainImagePreview" in recipe && recipe.mainImagePreview
                ? downloadFile(bucket, recipe.mainImagePreview)
                : Promise.resolve(undefined)
          )
        )
      : [];

    //use _id and send mainImagePreview data for frontend
    const recipesForPreview = slicedRecipes.length
      ? slicedRecipes.map(
          (
            recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE,
            i: number
          ) => {
            if ("mainImagePreview" in recipe) {
              const { recipeId, mainImagePreview, ...others } = recipe;
              return {
                _id: recipeId,
                mainImagePreview: mainImagePreviews[i],
                ...others,
              };
            } else {
              const { recipeId, ...others } = recipe;
              return {
                _id: recipeId,
                ...others,
              };
            }
          }
        )
      : [];

    return NextResponse.json(
      {
        success: true,
        data: recipesForPreview,
        numberOfRecipes: filteredRecipes.length,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (!isApiError(err)) return returnNonApiErrorResponse();

    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}

///Update recipes in user data
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const newBody = convertRecipeToUserRecipe(body);

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);
    const recipes = user.toObject().recipes;

    const newRecipes = recipes.length ? [...recipes, newBody] : [newBody];

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    //change recipeId to _id for frontend
    const structuredRecipes = updatedUser
      .toObject()
      .recipes.map(
        (
          recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
        ) => {
          const { recipeId, ...others } = recipe;
          return {
            _id: recipeId,
            ...others,
          };
        }
      );

    return NextResponse.json(
      {
        success: true,
        message: "User recipe created successfully",
        data: structuredRecipes,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (!isApiError(err)) return returnNonApiErrorResponse();

    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const newBody = convertRecipeToUserRecipe(body);

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);
    const recipes = user.toObject().recipes;

    //filter out updated recipe and add again
    const recipesForNotUpdate = recipes.length
      ? recipes.filter(
          (
            recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
          ) => recipe.recipeId !== newBody.recipeId
        )
      : [];
    const newRecipes = [...recipesForNotUpdate, newBody];

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    //change recipeId to _id for frontend
    const structuredRecipes = updatedUser
      .toObject()
      .recipes.map(
        (
          recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE
        ) => {
          const { recipeId, ...others } = recipe;
          return {
            _id: recipeId,
            ...others,
          };
        }
      );

    return NextResponse.json(
      {
        success: true,
        message: "User recipe updated successfully",
        data: structuredRecipes,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (!isApiError(err)) return returnNonApiErrorResponse();

    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const recipeIdsArr: string[] = body.ids;

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);

    const recipes = user.toObject().recipes;

    const deletedIndexes = recipeIdsArr.map((id) =>
      recipes.findIndex(
        (recipe: TYPE_USER_RECIPE_DATABASE | TYPE_USER_RECIPE_LINK_DATABASE) =>
          recipe.recipeId === id
      )
    );

    if (deletedIndexes.includes(-1)) {
      const err = new Error("Recipe not found") as MyError;
      err.statusCode = 404;
      throw err;
    }

    const recipesArr = [...recipes];
    //fill deleted index place with null
    deletedIndexes.forEach((index) => recipesArr.fill(null, index, index + 1));
    //filter out deleted recipes
    const newRecipes = recipesArr.filter((recipe) => recipe);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User recipe deleted successfully",
        data: updatedUser.recipes,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (!isApiError(err)) return returnNonApiErrorResponse();

    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}
