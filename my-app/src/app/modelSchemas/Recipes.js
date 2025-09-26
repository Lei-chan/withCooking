import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(Object);

export default mongoose.model("recipes", RecipeSchema);
