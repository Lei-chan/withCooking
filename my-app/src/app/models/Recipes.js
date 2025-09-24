import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  id: String,
  favorite: Boolean,
  region: String,
  mainImage: String,
  title: String,
  author: String,
  servings: { servings: Number, unit: String, customUnit: String },
  temperatures: { temperatures: [Number], unit: "℉" | "℃" },
  ingredients: [
    {
      ingredient: String,
      // amount: Number | String,
      amount: Number,
      unit: String,
      customUnit: String,
      id: Number,
      convertion: {
        metric: { amount: Number, unit: String } | "",
        us: { amount: Number, unit: String } | "",
        japan: { amount: Number, unit: String } | "",
        australia: { amount: Number, unit: String } | "",
        metricCup: { amount: Number, unit: String } | "",
        g: { amount: Number, unit: String } | "",
        kg: { amount: Number, unit: String } | "",
        oz: { amount: Number, unit: String } | "",
        lb: { amount: Number, unit: String } | "",
        ml: { amount: Number, unit: String } | "",
        L: { amount: Number, unit: String } | "",
        USCup: { amount: Number, unit: String } | "",
        JapaneseCup: { amount: Number, unit: String } | "",
        ImperialCup: { amount: Number, unit: String } | "",
        riceCup: { amount: Number, unit: String } | "",
        tsp: { amount: Number, unit: String } | "",
        Tbsp: { amount: Number, unit: String } | "",
        AustralianTbsp: { amount: Number, unit: String } | "",
      },
    },
  ],
  instructions: [
    {
      instruction: String,
      image: String,
    },
  ],
  description: String,
  memoryImages: [String] | [],
  comments: String,
});

export default Recipe = mongoose.model("Recipe", RecipeSchema);
