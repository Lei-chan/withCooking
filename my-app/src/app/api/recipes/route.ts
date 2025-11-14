//next.js
import { NextRequest, NextResponse } from "next/server";
//database
import mongoose from "mongoose";
import connectDB from "../../lib/mongoDB";
import { getGridFSBucket } from "@/app/lib/mongoDB";
//schema
import Recipe from "@/app/lib/modelSchemas/Recipes";
//zod validation
import { recipeSchema } from "@/app/lib/validation";
//type
import {
  TYPE_FILE,
  TYPE_INSTRUCTION,
  TYPE_CONVERTED_FILE,
} from "@/app/lib/config/type";
//methods for authentication
import { authenticateToken, refreshAccessToken } from "@/app/lib/auth";
//general methods
import { downloadFile, getId } from "@/app/lib/helpers/api";

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

//For recipe created from scratch
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

    //upload mainImagePreview
    const mainImagePreview = body.mainImagePreview
      ? await uploadFile(bucket, body.mainImagePreview, {
          userId: id,
          recipeTitle: body.title,
          section: "mainImagePreview",
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
    newBody.mainImagePreview = mainImagePreview;
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
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}

//For recipe created from scratch
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

    //delete old mainImage from bucket
    if (recipe.mainImage?.data) {
      try {
        await bucket.delete(
          new mongoose.Types.ObjectId(recipe.mainImage.fileId)
        );
      } catch (err: any) {
        throw new Error(
          "Error while deleting mainImage from bucket",
          err.message
        );
      }
    }

    //upload mainImage (If no mainImage in body => undefined, if mainImage in body  => upload file)
    const mainImage = !body.mainImage
      ? undefined
      : await uploadFile(bucket, body.mainImage, {
          userId: id,
          recipeTitle: body.title,
          section: "mainImage",
        });

    const bodyMainImagePreview = body.mainImagePreview;
    //delete old mainImagePreview from bucket only when there's new data
    if (recipe.mainImagePreview && bodyMainImagePreview.data) {
      try {
        await bucket.delete(
          new mongoose.Types.ObjectId(recipe.mainImagePreview.fileId)
        );
      } catch (err: any) {
        throw new Error(
          "Error while deleting mainImagePreview from bucket",
          err.message
        );
      }
    }

    //upload mainImagePreview (If no mainImagePreview in body => undefined, if mainImagePreview in body and it has new data  => upload file, if mainImagePreview in body but it's been already uploaded => do nothing)
    let mainImagePreview;

    if (!bodyMainImagePreview) mainImagePreview = undefined;

    if (bodyMainImagePreview && bodyMainImagePreview.data)
      mainImagePreview = await uploadFile(bucket, bodyMainImagePreview, {
        userId: id,
        recipeTitle: body.title,
        section: "mainImagePreview",
      });

    if (bodyMainImagePreview && bodyMainImagePreview.fileId)
      mainImagePreview = bodyMainImagePreview;

    //delete old instruction images from bucket
    if (recipe.instructions.length) {
      try {
        await Promise.all(
          recipe.instructions.map(
            (inst: {
              instruction: string;
              image: TYPE_CONVERTED_FILE | undefined;
            }) => {
              inst.image
                ? bucket.delete(new mongoose.Types.ObjectId(inst.image.fileId))
                : Promise.resolve(undefined);
            }
          )
        );
      } catch (err: any) {
        throw new Error(
          "Error while deleting instruction images from bucket",
          err.message
        );
      }
    }

    //upload instruction images
    const instructionImages = body.instructions.length
      ? await uploadInstructionImages(bucket, body.instructions, {
          userId: id,
          recipeTitle: body.title,
          section: "instructionImage",
        })
      : [];

    //delete old memoryImages from bucket
    if (recipe.memoryImages.length) {
      try {
        await Promise.all(
          recipe.memoryImages.map((image: TYPE_CONVERTED_FILE) =>
            bucket.delete(new mongoose.Types.ObjectId(image.fileId))
          )
        );
      } catch (err: any) {
        throw new Error(
          "Error while deleting memoryImages from bucket",
          err.message
        );
      }
    }

    //upload memoryImages
    const memoryImages = body.memoryImages.length
      ? await uploadMemoryImages(bucket, body.memoryImages, {
          userId: id,
          recipeTitle: body.title,
          section: "memoryImage",
        })
      : [];

    //save recipe with image file id instead of actual data
    const newBody = { ...body };
    newBody.mainImage = mainImage;
    newBody.mainImagePreview = mainImagePreview;
    newBody.instructions = body.instructions.map(
      (inst: TYPE_INSTRUCTION, i: number) => {
        return { instruction: inst.instruction, image: instructionImages[i] };
      }
    );
    newBody.memoryImages = memoryImages;

    const newRecipe = await Recipe.findByIdAndUpdate(id, newBody, {
      new: true,
    }).select("-__v");

    //send actual image file data instead of file id to display except for mainImagePreview since it won't be used
    const structuredRecipe = { ...newRecipe.toObject() };
    structuredRecipe.mainImage = body.mainImage;
    // structuredRecipe.mainImagePreview = body.mainImagePreview;
    structuredRecipe.instructions = body.instructions;
    structuredRecipe.memoryImages = body.memoryImages;

    return NextResponse.json(
      {
        success: true,
        message: "Recipe updated successfully",
        data: structuredRecipe,
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

//For recipe created both from scratch and from external link
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

    const recipeObj = recipe.toObject();

    let newRecipe;
    if ("link" in recipeObj) {
      newRecipe = recipe;
    } else {
      const bucket = getGridFSBucket();

      const mainImage = recipe.mainImage
        ? await downloadFile(bucket, recipe.mainImage)
        : undefined;

      const instructionImages = recipe.instructions.length
        ? await Promise.all(
            recipe.instructions.map(
              (inst: {
                instruction: string;
                image: TYPE_CONVERTED_FILE | undefined;
              }) =>
                inst.image
                  ? downloadFile(bucket, inst.image)
                  : Promise.resolve(undefined)
            )
          )
        : [];

      const memoryImages = recipe.memoryImages.length
        ? await Promise.all(
            recipe.memoryImages.map((image: TYPE_CONVERTED_FILE) =>
              downloadFile(bucket, image)
            )
          )
        : [];

      //mainImagePreview image => data won't be sent since it won't be used, other images => data will be sent since it'll be used
      newRecipe = { ...recipeObj };
      newRecipe.mainImage = mainImage;
      newRecipe.instructions = recipeObj.instructions.map(
        (
          inst: { instruction: string; image: TYPE_CONVERTED_FILE | undefined },
          i: number
        ) => {
          return { instruction: inst.instruction, image: instructionImages[i] };
        }
      );
      newRecipe.memoryImages = memoryImages;
    }

    return NextResponse.json(
      { success: true, data: newRecipe },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, name: err.name },
      { status: err.statusCode || 500 }
    );
  }
}

//For recipe created both from scratch and external link
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const bucket = getGridFSBucket();

    const body = await req.json();
    const recipeIdArr: string[] = body.ids;

    //get recipes from ids
    const promiseRecipes = recipeIdArr.map((id) => Recipe.findById(id));
    const recipes = await Promise.all(promiseRecipes);

    //delete mainImages from bucket
    const promiseDeleteMainImage = recipes.map((recipe) =>
      recipe.mainImage
        ? bucket.delete(new mongoose.Types.ObjectId(recipe.mainImage.fileId))
        : Promise.resolve(undefined)
    );
    await Promise.all(promiseDeleteMainImage);

    //delete mainImagePreview from bucket
    const promiseDeleteMainImagePreview = recipes.map((recipe) =>
      recipe.mainImagePreview
        ? bucket.delete(
            new mongoose.Types.ObjectId(recipe.mainImagePreview.fileId)
          )
        : Promise.resolve(undefined)
    );
    await Promise.all(promiseDeleteMainImagePreview);

    //delete instruction images from bucket
    const promiseDeleteInstructionImages = recipes.flatMap((recipe) =>
      recipe.instructions?.length
        ? recipe.instructions.map(
            (inst: {
              instruction: string;
              image: TYPE_CONVERTED_FILE | undefined;
            }) =>
              inst.image
                ? bucket.delete(new mongoose.Types.ObjectId(inst.image.fileId))
                : Promise.resolve(undefined)
          )
        : Promise.resolve(undefined)
    );
    await Promise.all(promiseDeleteInstructionImages);

    //delete memoryImages from bucket
    const promiseDeleteMemoryImages = recipes.flatMap((recipe) =>
      recipe.memoryImages?.length
        ? recipe.memoryImages.map((image: TYPE_CONVERTED_FILE) =>
            bucket.delete(new mongoose.Types.ObjectId(image.fileId))
          )
        : Promise.resolve(undefined)
    );
    await Promise.all(promiseDeleteMemoryImages);

    const promiseDeleteRecipes = recipeIdArr.map((id) =>
      Recipe.findByIdAndDelete(id)
    );
    const deletedRecipes = await Promise.all(promiseDeleteRecipes);

    return NextResponse.json(
      {
        success: true,
        message: "Recipe deleted successfully",
        data: deletedRecipes,
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
