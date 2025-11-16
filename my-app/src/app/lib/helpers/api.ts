import { NextRequest, NextResponse } from "next/server";
import {
  MyError,
  TYPE_CONVERTED_FILE,
  TYPE_RECIPE,
  TYPE_RECIPE_LINK,
} from "../config/type";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

export const returnNonApiErrorResponse = () =>
  NextResponse.json(
    { success: false, error: "Unkown error occured" },
    { status: 500 }
  );

export function getId(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid Id provided") as MyError;
    err.statusCode = 400;
    throw err;
  }

  return id;
}

export function downloadFile(bucket: GridFSBucket, file: TYPE_CONVERTED_FILE) {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(
      file.fileId instanceof mongoose.Types.ObjectId
        ? file.fileId
        : new mongoose.Types.ObjectId(file.fileId)
    );

    const chunks: Buffer[] = [];
    downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));

    downloadStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const parsedBuffer = JSON.parse(buffer.toString("utf-8"));
      resolve(parsedBuffer);
    });

    downloadStream.on("error", () =>
      reject(new Error("Error while downloading files"))
    );
  });
}

export const convertRecipeToUserRecipe = (
  body: TYPE_RECIPE | TYPE_RECIPE_LINK
) => {
  if ("link" in body) {
    const { _id, title, favorite, link, createdAt, updatedAt } = body;
    return { recipeId: _id, title, favorite, link, createdAt, updatedAt };
  } else {
    const {
      _id,
      mainImagePreview,
      title,
      author,
      favorite,
      ingredients,
      createdAt,
      updatedAt,
      ...others
    } = body;
    return {
      recipeId: _id,
      mainImagePreview,
      title,
      author,
      favorite,
      ingredients,
      createdAt,
      updatedAt,
    };
  }
};
