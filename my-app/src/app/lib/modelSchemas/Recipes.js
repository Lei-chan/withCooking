import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  favorite: Boolean,
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
      id: {},
      convertion: {},
    },
  ],
  preparation: String,
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
  updatedAt: String,
});

const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

export default Recipe;
