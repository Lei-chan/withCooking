"use client";
//react
import React from "react";
//componets
import { RecipeEdit } from "@/app/lib/components/components";

export default function CreateRecipe() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundImage:
          "linear-gradient(rgba(255, 241, 117, 1), rgba(255, 190, 117, 1))",
        width: "100%",
        height: "fit-content",
        padding: "2% 0",
      }}
    >
      <RecipeEdit
        recipe={{
          favorite: false,
          mainImage: undefined,
          mainImagePreview: undefined,
          title: "",
          author: "",
          servings: { servings: 0, unit: "", customUnit: "" },
          temperatures: { temperatures: [], unit: "℉" },
          ingredients: [
            {
              ingredient: "",
              amount: 0,
              unit: "g",
              id: undefined,
              convertion: {
                original: { amount: 0, unit: "g" },
                metric: undefined,
                us: undefined,
                japan: undefined,
                australia: undefined,
                metricCup: undefined,
                g: undefined,
                kg: undefined,
                oz: undefined,
                lb: undefined,
                ml: undefined,
                L: undefined,
                usCup: undefined,
                japaneseCup: undefined,
                imperialCup: undefined,
                riceCup: undefined,
                tsp: undefined,
                tbsp: undefined,
                australianTbsp: undefined,
              },
            },
          ],
          preparation: "",
          instructions: [
            {
              instruction: "",
              image: undefined,
            },
          ],
          description: "",
          memoryImages: [],
          comments: "",
        }}
        error=""
        createOrUpdate="create"
      />
    </div>
  );
}
