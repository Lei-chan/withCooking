import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },
    recipes: {
      recipeId: String,
      mainImagePreview: Object,
      title: String,
      author: String,
      favorite: Boolean,
      ingredients: Array,
      createdAt: String,
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
