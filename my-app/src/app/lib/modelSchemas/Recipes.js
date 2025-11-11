import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  favorite: Boolean,
  mainImage: {},
  mainImagePreview: {},
  title: String,
  author: {},
  servings: {},
  temperatures: {},
  ingredients: {},
  preparation: {},
  instructions: {},
  description: {},
  memoryImages: {},
  comments: {},
  link: {},
  createdAt: String,
  updatedAt: String,
});

const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

export default Recipe;
