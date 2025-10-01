import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongoDB";
import Recipe from "@/app/modelSchemas/Recipes";
import { recipeSchema } from "@/app/lib/validation";
import { getGridFSBucket } from "@/app/lib/mongoDB";
import { TYPE_FILE, TYPE_INSTRUCTION, TYPE_CONVERTED_FILE } from "@/app/config";
import { authenticateToken, refreshAccessToken } from "@/app/lib/auth";
import { resolve } from "path";

function getId(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!mongoose.isValidObjectId(id)) {
    const err: any = new Error("Invalid Id provided");
    err.statusCode = 400;
    throw err;
  }

  return id;
}

function uploadFile(bucket: any, file: TYPE_FILE, metadata: any) {
  return new Promise((resolve, reject) => {
    const jsonBuffer = Buffer.from(JSON.stringify(file));

    const uploadStream = bucket.openUploadStream(
      file.filename || "unnamed-file.json",
      { contentType: "application/json", metadata: { ...metadata } }
    );

    uploadStream.end(jsonBuffer);

    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id,
        filename: file.filename,
        contentType: file.contentType,
        fileSize: file.fileSize,
        uploadedAt: new Date(),
      });
    });

    uploadStream.on("error", () =>
      reject(new Error("Error while uploading file"))
    );
  });
}

function downloadFile(bucket: any, file: any) {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(new ObjectId(file.fileId));

    const chunks: any[] = [];
    downloadStream.on("data", (chunk: any) => chunks.push(chunk));

    downloadStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(JSON.parse(buffer.toString("utf-8")));
    });

    downloadStream.on("error", () =>
      reject(new Error("Error while downloading files"))
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const bucket = getGridFSBucket();

    const body = await req.json();

    let { id, newAccessToken } = await authenticateToken(req);

    //try to refresh accessToken when access token is expired
    if (!id) {
      const tokenInfo = await refreshAccessToken();
      id = tokenInfo.id;
      newAccessToken = tokenInfo.newAccessToken;
    }

    const result = recipeSchema.safeParse(body);
    if (!result.success) {
      const errTarget = result.error.issues[0];
      const err: any = new Error(
        `<Error field: ${String(errTarget.path[0])}> ${errTarget.message}`
      );
      err.statusCode = 400;

      throw err;
    }

    const uploadMainImage =
      body.mainImage &&
      (await uploadFile(bucket, body.mainImage, {
        userId: id,
        recipeTitle: body.title,
        section: "mainImage",
      }));

    const uploadInstImages = await Promise.all(
      body.instructions.map((inst: TYPE_INSTRUCTION, i: number) =>
        inst.image
          ? uploadFile(bucket, inst.image, {
              userId: id,
              recipeTitle: body.title,
              section: "instructionImage",
              index: i,
            })
          : Promise.resolve(undefined)
      )
    );

    const uploadMemoryImages =
      body.memoryImages.length &&
      (await Promise.all(
        body.memoryImages.map((image: TYPE_FILE, i: number) =>
          uploadFile(bucket, image, {
            userId: id,
            recipeTitle: body.title,
            section: "memoryImage",
            index: i,
          })
        )
      ));

    const newBody = { ...body };
    newBody.mainImage = uploadMainImage || undefined;
    newBody.instructions = body.instructions.map(
      (inst: TYPE_INSTRUCTION, i: number) => {
        return { instruction: inst.instruction, image: uploadInstImages[i] };
      }
    );
    newBody.memoryImages = body.memoryImages.length ? uploadMemoryImages : [];

    const recipe = await Recipe.create(newBody);

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
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const bucket = getGridFSBucket();

    const id = getId(req);

    const recipe = await Recipe.findById(id).select("-__v");

    if (!recipe) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    const mainImage =
      recipe.mainImage && (await downloadFile(bucket, recipe.mainImage));
    const instructionImages = await Promise.all(
      recipe.instructions.map(
        (inst: {
          instruction: string;
          image: TYPE_CONVERTED_FILE | undefined;
        }) =>
          inst.image
            ? downloadFile(bucket, inst.image.fileId)
            : Promise.resolve(undefined)
      )
    );
    const memoryImages =
      recipe.memoryImages.length &&
      (await Promise.all(
        recipe.memoryImages.map((image: TYPE_CONVERTED_FILE) =>
          downloadFile(bucket, image.fileId)
        )
      ));

    const newRecipe = { ...recipe };
    newRecipe.mainImage = mainImage || undefined;
    newRecipe.instructions = recipe.instructions.map(
      (
        inst: { instruction: string; image: TYPE_CONVERTED_FILE | undefined },
        i: number
      ) => {
        return { instruction: inst.instruction, image: instructionImages[i] };
      }
    );
    newRecipe.memoryImages = memoryImages || [];

    return NextResponse.json(
      { success: true, data: newRecipe },
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
