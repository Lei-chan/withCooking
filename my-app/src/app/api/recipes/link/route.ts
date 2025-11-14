//This module is to create or update recipe created with external link

//next.js
import { NextRequest, NextResponse } from "next/server";
//database
import connectDB from "@/app/lib/mongoDB";
//schema
import Recipe from "@/app/lib/modelSchemas/Recipes";
//zod validation
import { recipeLinkSchema } from "@/app/lib/validation";
//methods for authentication
import { authenticateToken, refreshAccessToken } from "@/app/lib/auth";
//general method
import { getId } from "@/app/lib/helpers/api";

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

    const result = recipeLinkSchema.safeParse(body);
    if (!result.success) {
      const errTarget = result.error.issues[0];
      const err: any = new Error(
        `<Error field: ${String(errTarget.path[0])}> ${errTarget.message}`
      );
      err.statusCode = 400;

      throw err;
    }

    const recipe = await Recipe.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Recipe created successfully",
        data: recipe,
        newAccessToken,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const id = getId(req);
    const body = await req.json();

    const result = recipeLinkSchema.safeParse(body);

    if (!result.success) {
      const errTarget = result.error.issues[0];
      const err: any = new Error(
        `<Error field: ${String(errTarget.path[0])}> ${errTarget.message}`
      );
      err.statusCode = 400;

      throw err;
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    const newRecipe = await Recipe.findByIdAndUpdate(id, body, {
      new: true,
    }).select("-__v");

    return NextResponse.json(
      {
        success: true,
        message: "Recipe updated successfully",
        data: newRecipe,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}
