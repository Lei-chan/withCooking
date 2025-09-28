import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(Object);

const Recipes =
  mongoose.models.Recipes || mongoose.model("Recipes", RecipeSchema);

export default Recipes;
