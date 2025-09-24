import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { unique } from "next/dist/build/utils";
import { match } from "assert";
import {
  PASSWORD_MIN_DIGIT,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_UPPERCASE,
} from "../config";

const UserSchema = new mongoose.Schema(
  {
    // id: { type: String, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[^s@]+@[^s@]+.[^s@]+$/,
        "Please provide a valid email address.",
      ],
      required: [true, "Email address is required."],
      unique: true,
    },
    password: {
      type: String,
      //   trim: true,
      //   match: [
      //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      //     `Please provide a password that contains at least ${PASSWORD_MIN_LOWERCASE} lowercase, ${PASSWORD_MIN_UPPERCASE} uppercase, and ${PASSWORD_MIN_DIGIT} digit.`,
      //   ],
      required: [true, "Password is required."],
      //   minLength: [8, "Password must be at least 8 characters"],
    },
    recipes: [
      {
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
      },
    ],
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

export default User = mongoose.model("User", UserSchema);
