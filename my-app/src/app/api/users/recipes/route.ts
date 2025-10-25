import connectDB from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/lib/modelSchemas/User";
import { authenticateToken } from "@/app/lib/auth";
import { refreshAccessToken } from "@/app/lib/auth";
import { getGridFSBucket } from "@/app/lib/mongoDB";
import { downloadFile } from "../../recipes/route";
import { getOrderedRecipes } from "@/app/lib/helper";
import next from "next";

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

    // const mainImages = slicedRecipes.length
    //   ? await Promise.all(
    //       slicedRecipes.map((recipe: any) =>
    //         recipe.mainImage
    //           ? downloadFile(bucket, recipe.mainImage)
    //           : Promise.resolve(undefined)
    //       )
    //     )
    //   : [];
    const mainImagePreviews = slicedRecipes.length
      ? await Promise.all(
          slicedRecipes.map((recipe: any) => {
            console.log(recipe.mainImagePreview);
            return recipe.mainImagePreview
              ? downloadFile(bucket, recipe.mainImagePreview)
              : Promise.resolve(undefined);
          })
        )
      : [];

    const recipesForPreview = slicedRecipes.length
      ? slicedRecipes.map((recipe: any, i: number) => {
          const newRecipe = {
            _id: recipe._id,
            title: recipe.title,
            // mainImage: mainImages[i],
            mainImagePreview: mainImagePreviews[i],
            favorite: recipe.favorite,
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

    const body = await req.json();
    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);

    const newRecipes = user.recipes.length ? [...user.recipes, body] : [body];

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { recipes: newRecipes },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User recipe created successfully",
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

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const user = await User.findById(id);

    //recipe id is inside _doc
    const recipesForNotUpdate = user.recipes.length
      ? user.recipes.filter((recipe: any) => recipe._id !== body._doc._id)
      : [];
    const newRecipes = user.recipes.length
      ? [...recipesForNotUpdate, body]
      : [body];

    const updatedUser = await User.findByIdAndUpdate(
      id,
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
      recipes.findIndex((recipe: any) => recipe._id === id)
    );

    if (deletedIndexes.includes(-1)) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    const newRecipes = [...recipes];
    deletedIndexes.forEach((index) => newRecipes.splice(index, 1));

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
