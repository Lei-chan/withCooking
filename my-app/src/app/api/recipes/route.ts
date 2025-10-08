import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongoDB";
import Recipe from "@/app/lib/modelSchemas/Recipes";
import { recipeSchema } from "@/app/lib/validation";
import { getGridFSBucket } from "@/app/lib/mongoDB";
import {
  TYPE_FILE,
  TYPE_INSTRUCTION,
  TYPE_CONVERTED_FILE,
} from "@/app/lib/config";
import { authenticateToken, refreshAccessToken } from "@/app/lib/auth";
import { parse, resolve } from "path";

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

export function downloadFile(bucket: any, file: any) {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(
      file.fileId instanceof mongoose.Types.ObjectId
        ? file.fileId
        : new ObjectId(file.fileId)
    );

    const chunks: any[] = [];
    downloadStream.on("data", (chunk: any) => chunks.push(chunk));

    downloadStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const parsedBuffer = JSON.parse(buffer.toString("utf-8"));
      // console.log(parsedBuffer);
      resolve(parsedBuffer);
    });

    downloadStream.on("error", () =>
      reject(new Error("Error while downloading files"))
    );
  });
}

function uploadInstructionImages(
  bucket: any,
  instructions: TYPE_INSTRUCTION[],
  metadata: any
) {
  return Promise.all(
    instructions.map((inst: TYPE_INSTRUCTION, i: number) =>
      inst.image
        ? uploadFile(bucket, inst.image, {
            ...metadata,
            index: i,
          })
        : Promise.resolve(undefined)
    )
  );
}

function uploadMemoryImages(
  bucket: any,
  memoryImages: TYPE_FILE[],
  metadata: any
) {
  return Promise.all(
    memoryImages.map((image: TYPE_FILE, i: number) =>
      uploadFile(bucket, image, { ...metadata, index: i })
    )
  );
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

    //upload mainImage
    const mainImage = body.mainImage
      ? await uploadFile(bucket, body.mainImage, {
          userId: id,
          recipeTitle: body.title,
          section: "mainImage",
        })
      : undefined;

    //upload instruction images
    const instructionImages = await uploadInstructionImages(
      bucket,
      body.instructions,
      { userId: id, recipeTitle: body.title, section: "instructionImage" }
    );

    //upload memoryImages
    const memoryImages = body.memoryImages.length
      ? await uploadMemoryImages(bucket, body.memoryImages, {
          userId: id,
          recipeTitle: body.title,
          section: "memoryImage",
        })
      : [];

    const newBody = { ...body };
    newBody.mainImage = mainImage;
    newBody.instructions = body.instructions.map(
      (inst: TYPE_INSTRUCTION, i: number) => {
        return { instruction: inst.instruction, image: instructionImages[i] };
      }
    );
    newBody.memoryImages = memoryImages;

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

    const mainImage = recipe.mainImage
      ? await downloadFile(bucket, recipe.mainImage)
      : undefined;

    const instructionImages = await Promise.all(
      recipe.instructions.map(
        (inst: {
          instruction: string;
          image: TYPE_CONVERTED_FILE | undefined;
        }) =>
          inst.image
            ? downloadFile(bucket, inst.image)
            : Promise.resolve(undefined)
      )
    );

    const memoryImages = recipe.memoryImages.length
      ? await Promise.all(
          recipe.memoryImages.map((image: TYPE_CONVERTED_FILE) =>
            downloadFile(bucket, image)
          )
        )
      : [];

    const newRecipe = { ...recipe };
    newRecipe.mainImage = mainImage;
    newRecipe.instructions = recipe.instructions.map(
      (
        inst: { instruction: string; image: TYPE_CONVERTED_FILE | undefined },
        i: number
      ) => {
        return { instruction: inst.instruction, image: instructionImages[i] };
      }
    );
    newRecipe.memoryImages = memoryImages;

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
    const bucket = getGridFSBucket();

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

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      const err: any = new Error("Recipe not found");
      err.statusCode = 404;
      throw err;
    }

    //delete existing mainImage from bucket
    recipe.mainImage &&
      (await bucket.delete(new ObjectId(recipe.mainImage.fileId)));

    //delete existing instruction images from bucket
    await Promise.all(
      recipe.instructions.map(
        (inst: {
          instruction: string;
          image: TYPE_CONVERTED_FILE | undefined;
        }) => {
          inst.image
            ? bucket.delete(new ObjectId(inst.image.fileId))
            : Promise.resolve(undefined);
        }
      )
    );

    //delete existing memoryImages from bucket
    recipe.memoryImages.length &&
      (await Promise.all(
        recipe.memoryImages.map((image: TYPE_CONVERTED_FILE) =>
          bucket.delete(new ObjectId(image.fileId))
        )
      ));

    //upload mainImage
    const mainImage = !body.mainImage
      ? undefined
      : await uploadFile(bucket, body.mainImage, {
          userId: id,
          recipeTitle: body.title,
          section: "mainImage",
        });

    //upload instruction images
    const instructionImages = await uploadInstructionImages(
      bucket,
      body.instructions,
      { userId: id, recipeTitle: body.title, section: "instructionImage" }
    );

    //upload memoryImages
    const memoryImages = body.memoryImages.length
      ? await uploadMemoryImages(bucket, body.memoryImages, {
          userId: id,
          recipeTitle: body.title,
          section: "memoryImage",
        })
      : [];

    const newBody = { ...body };
    newBody.mainImage = mainImage;
    newBody.instructions = body.instructions.map(
      (inst: TYPE_INSTRUCTION, i: number) => {
        return { instruction: inst.instruction, image: instructionImages[i] };
      }
    );
    newBody.memoryImages = memoryImages;

    const newRecipe = await Recipe.findByIdAndUpdate(id, newBody, {
      new: true,
    }).select("-__v");

    const strucaturedRecipe = { ...newRecipe };
    strucaturedRecipe.mainImage = body.mainImage;
    strucaturedRecipe.instructions = body.instructions;
    strucaturedRecipe.memoryImages = body.memoryImages;

    return NextResponse.json(
      {
        success: true,
        message: "Recipe updated successfully",
        data: strucaturedRecipe,
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
