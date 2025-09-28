import connectDB from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/modelSchemas/User";
import { authenticateToken } from "@/app/lib/auth";
import { refreshAccessToken } from "../route";
import { AccessTokenContext } from "@/app/context";
import { TYPE_RECIPE } from "@/app/config";

//get recipes in user data
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;

    const keyword = searchParams.get("keyword");
    const startIndex = searchParams.get("startIndex");
    const endIndex = searchParams.get("endIndex");

    if (!startIndex || !endIndex) {
      const err: any = new Error("StartIndex and endIndex are required");
      err.statusCode = 400;
      throw err;
    }

    //validate token
    let userId = await authenticateToken(req);
    let newAccessToken;

    //try to refresh accessToken
    if (!userId) {
      const { id, accessToken } = await refreshAccessToken();
      userId = id;
      newAccessToken = AccessTokenContext;
    }

    const recipes = await User.findById(userId).select("recipes");
    const filteredRecipes =
      keyword && recipes
        ? recipes.filter((recipe: any) => {
            const structuredKeyword = keyword.trim().toLowerCase();

            return (
              recipe.title.toLowerCase().includes(structuredKeyword) ||
              recipe.ingredients.find((ing: any) =>
                ing.ingredient.toLowerCase().includes(structuredKeyword)
              )
            );
          })
        : recipes;

    if (!filteredRecipes || !filteredRecipes.length) {
      const err: any = new Error("Recipes not found");
      err.statusCode = 404;
      throw err;
    }

    const slicedRecipes = recipes.slice(
      parseInt(startIndex),
      parseInt(endIndex)
    );

    return NextResponse.json(
      { success: true, data: slicedRecipes, newAccessToken },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

///Update recipes in user data
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    let userId = await authenticateToken(req);
    let newAccessToken;

    //try to refresh accessToken
    if (!userId) {
      const { id, accessToken } = await refreshAccessToken();
      userId = id;
      newAccessToken = accessToken;
    }

    const userRecipes = await User.findById(userId).select("recipes");
    const newRecipes = userRecipes ? [...userRecipes, body] : [body];

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User recipe updated successfully",
        data: updatedUser,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const recipeId = searchParams.get("id");

    let userId = await authenticateToken(req);
    let newAccessToken;

    if (!userId) {
      const { id, accessToken } = await refreshAccessToken();
      userId = id;
      newAccessToken = accessToken;
    }

    const recipes = await User.findById(userId).select("recipes");
    const deletedRecipeIndex = recipes.findIndex(
      (recipe: any) => recipe.recipeId === recipeId
    );

    if (deletedRecipeIndex === -1) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    const newRecipes = recipes.toSpliced(deletedRecipeIndex, 1);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User recipe deleted successfully",
        data: updatedUser,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
