//next.js
import { NextRequest, NextResponse } from "next/server";
//schema
import User from "@/app/lib/modelSchemas/User";
//database
import connectDB from "@/app/lib/mongoDB";
import { getGridFSBucket } from "@/app/lib/mongoDB";
//method for file downloading
import { downloadFile } from "../../recipes/route";
//methods for authentication
import { refreshAccessToken, authenticateToken } from "@/app/lib/auth";
//methods for recipes
import { getOrderedRecipes } from "@/app/lib/helpers/recipes";

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
      const err: any = new Error("startIndex and endIndex are required");
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
    const recipes = user.recipes ? getOrderedRecipes(user.recipes) : [];

    const filteredRecipes =
      keyword && recipes.length
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

    const slicedRecipes = filteredRecipes.slice(
      parseInt(startIndex),
      parseInt(endIndex)
    );

    const mainImagePreviews = slicedRecipes.length
      ? await Promise.all(
          slicedRecipes.map((recipe: any) =>
            recipe.mainImagePreview
              ? downloadFile(bucket, recipe.mainImagePreview)
              : Promise.resolve(undefined)
          )
        )
      : [];

    //use _id and send mainImagePreview data for frontend
    const recipesForPreview = slicedRecipes.length
      ? slicedRecipes.map((recipe: any, i: number) => {
          const { recipeId, mainImagePreview, ...others } = recipe;
          const newRecipe = {
            _id: recipeId,
            mainImagePreview: mainImagePreviews[i],
            ...others,
          };
          return newRecipe;
        })
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
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

///Update recipes in user data
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      _id,
      mainImagePreview,
      title,
      author,
      favorite,
      ingredients,
      createdAt,
      ...others
    } = await req.json();
    const newBody = {
      recipeId: _id,
      mainImagePreview,
      title,
      author,
      favorite,
      ingredients,
      createdAt,
    };
    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);

    const newRecipes = user.recipes.length
      ? [...user.recipes, newBody]
      : [newBody];

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    //change recipeId to _id for frontend
    const structuredRecipes = updatedUser.recipes.map((recipe: any) => {
      const { recipeId, ...others } = recipe;
      return {
        _id: recipeId,
        ...others,
      };
    });

    console.log("POST: user recipes", structuredRecipes);
    return NextResponse.json(
      {
        success: true,
        message: "User recipe created successfully",
        data: structuredRecipes,
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

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const {
      _id,
      mainImagePreview,
      title,
      author,
      favorite,
      ingredients,
      createdAt,
      ...others
    } = await req.json();
    const newBody = {
      recipeId: _id,
      mainImagePreview,
      title,
      author,
      favorite,
      ingredients,
      createdAt,
    };

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);

    //filter out updated recipe and add again
    const recipesForNotUpdate = user.recipes.length
      ? user.recipes.filter(
          (recipe: any) => recipe.recipeId !== newBody.recipeId
        )
      : [];
    const newRecipes = [...recipesForNotUpdate, newBody];

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    //change recipeId to _id for frontend
    const structuredRecipes = updatedUser.recipes.map((recipe: any) => {
      const { recipeId, ...others } = recipe;
      return {
        _id: recipeId,
        ...others,
      };
    });
    console.log("PUT: user recipes", structuredRecipes);

    return NextResponse.json(
      {
        success: true,
        message: "User recipe updated successfully",
        data: structuredRecipes,
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

    const recipes = user.recipes;

    const deletedIndexes = recipeIdsArr.map((id) =>
      recipes.findIndex((recipe: any) => recipe.recipeId === id)
    );

    if (deletedIndexes.includes(-1)) {
      const err: any = new Error("Recipe not found");
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
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
