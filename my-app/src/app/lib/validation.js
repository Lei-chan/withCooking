import * as z from "zod";
import {
  MAX_SERVINGS,
  PASSWORD_MIN_DIGIT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LOWERCASE,
  PASSWORD_MIN_UPPERCASE,
  PASSWORD_REGEX,
} from "../config";

export const recipeSchema = z.object({
  recipeId: z.string().optional(), //only for recipe in user info
  favorite: z.boolean(),
  region: z.string(),
  mainImage: z.any(),
  title: z.string(),
  author: z.string(),
  servings: z.object({
    servings: z
      .number()
      .lte(MAX_SERVINGS, `Maximum allowed servings is ${MAX_SERVINGS}`),
    unit: z.string(),
    customUnit: z.string(),
  }),
  temperatures: z.object({
    temperatures: z.array(z.number()),
    unit: z.string(),
    // unit: z.stringFormat("temperature-unit", () => val === "℉" || val === "℃"),
  }),
  ingredients: z.array(
    z.object({
      ingredient: z.string(),
      amount: z.number(),
      unit: z.string(),
      customUnit: z.string(),
      id: z.any(),
      convertion: z.any(),
    })
  ),
  instructions: z.array(
    z.object({
      instruction: z.string(),
      image: z.any(),
    })
  ),
  description: z.string(),
  memoryImages: z.array(z.any()),
  comments: z.string(),
  createdAt: z.iso.datetime(),
});

export const userSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide valid email address"),
  password: z
    .string()
    .trim()
    .regex(
      PASSWORD_REGEX,
      `Please set password that is more than ${PASSWORD_MIN_LENGTH} characters logn, with at least ${PASSWORD_MIN_LOWERCASE} lowercase, ${PASSWORD_MIN_UPPERCASE} uppercase, and ${PASSWORD_MIN_DIGIT} digit`
    ),
  recipes: z.array(recipeSchema).optional(),
});

export const passwordUpdateSchema = z.object({
  newPassword: z
    .string()
    .trim()
    .regex(
      PASSWORD_REGEX,
      `Please set password that is more than ${PASSWORD_MIN_LENGTH} characters long, with at least ${PASSWORD_MIN_LOWERCASE} lowercase, ${PASSWORD_MIN_UPPERCASE} uppercase, and ${PASSWORD_MIN_DIGIT} digit`
    ),
});

export const userOtherUpdateSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide valid email address")
    .optional(),
});
