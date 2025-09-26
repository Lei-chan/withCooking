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
      //   trim: true,
      //   match: [
      //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      //     `Please provide a password that contains at least ${PASSWORD_MIN_LOWERCASE} lowercase, ${PASSWORD_MIN_UPPERCASE} uppercase, and ${PASSWORD_MIN_DIGIT} digit.`,
      //   ],
      //   minLength: [8, "Password must be at least 8 characters"],
    },
    recipes: Array,
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
