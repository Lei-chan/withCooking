import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  //recipeId => only for recipe in user info
  recipeId: String,
  favorite: Boolean,
  region: String,
  mainImage: {},
  mainImagePreview: {},
  title: String,
  author: String,
  servings: {
    servings: Number,
    unit: String,
    customUnit: String,
  },
  temperatures: {
    temperatures: [Number],
    unit: String,
  },
  ingredients: [
    {
      ingredient: String,
      amount: Number,
      unit: String,
      customUnit: String,
      id: {},
      convertion: {},
    },
  ],
  instructions: [
    {
      instruction: String,
      image: {},
    },
  ],
  description: String,
  memoryImages: [{}],
  comments: String,
  createdAt: String,
});

const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

export default Recipe;
