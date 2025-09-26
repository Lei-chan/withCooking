import connectDB from "@/app/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/modelSchemas/User";
import { authenticateToken } from "@/app/lib/auth";
import { refreshAccessToken } from "../route";

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
    let userId = await authenticateToken();

    //try to refresh accessToken
    if (!userId) {
      const id = await refreshAccessToken();
      userId = id;
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
      { success: true, data: slicedRecipes },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
