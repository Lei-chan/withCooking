import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongoDB";
import Recipe from "@/app/modelSchemas/Recipes";
import { recipeSchema } from "@/app/lib/validation";

function getId(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  console.log("id", id);

  if (!mongoose.isValidObjectId(id)) {
    const err: any = new Error("Invalid Id provided");
    err.statusCode = 400;
    throw err;
  }

  return id;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const result = recipeSchema.safeParse(body);
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

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const id = getId(req);

    const recipe = await Recipe.findById(id).select("-__v");

    if (!recipe) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    return NextResponse.json({ success: true, data: recipe }, { status: 200 });
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

    const id = getId(req);
    const body = await req.json();

    const result = recipeSchema.safeParse(body);

    if (!result.success) {
      const errTarget = result.error.issues[0];
      const err: any = new Error(
        `<Error field: ${String(errTarget.path[0])}> ${errTarget.message}`
      );
      err.statusCode = 400;

      throw err;
    }

    const recipe = await Recipe.findByIdAndUpdate(id, body, {
      new: true,
    }).select("-__v");

    if (!recipe) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recipe updated successfully",
        data: recipe,
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
    await connectDB();

    const id = getId(req);

    const recipe = await Recipe.findByIdAndDelete(id).select("-__v");

    if (!recipe) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Recipe deleted successfully",
        data: recipe,
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
