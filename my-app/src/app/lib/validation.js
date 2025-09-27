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
  favorite: z.boolean(),
  region: z.string(),
  mainImage: z.string(),
  title: z.string(),
  author: z.string(),
  servings: z.object({
    servings: z
      .number()
      .lte(MAX_SERVINGS, `Maximum allowd servings is ${MAX_SERVINGS}`),
    unit: z.string(),
    customUnit: z.string(),
  }),
  temperatures: z.object({
    temperatures: [z.number()],
    unit: z.stringFormat("temperature-unit", () => val === "℉" || val === "℃"),
  }),
  ingredients: z.array(
    z.object({
      ingredient: z.string(),
      // amount: z.number() | z.string(),
      amount: z.number(),
      unit: z.string(),
      customUnit: z.string(),
      id: z.number(),
      convertion: {
        metric: { amount: z.number(), unit: z.string() } | z.string(),
        us: { amount: z.number(), unit: z.string() } | z.string(),
        japan: { amount: z.number(), unit: z.string() } | z.string(),
        australia: { amount: z.number(), unit: z.string() } | z.string(),
        metricCup: { amount: z.number(), unit: z.string() } | z.string(),
        g: { amount: z.number(), unit: z.string() } | z.string(),
        kg: { amount: z.number(), unit: z.string() } | z.string(),
        oz: { amount: z.number(), unit: z.string() } | z.string(),
        lb: { amount: z.number(), unit: z.string() } | z.string(),
        ml: { amount: z.number(), unit: z.string() } | z.string(),
        L: { amount: z.number(), unit: z.string() } | z.string(),
        USCup: { amount: z.number(), unit: z.string() } | z.string(),
        JapaneseCup: { amount: z.number(), unit: z.string() } | z.string(),
        ImperialCup: { amount: z.number(), unit: z.string() } | z.string(),
        riceCup: { amount: z.number(), unit: z.string() } | z.string(),
        tsp: { amount: z.number(), unit: z.string() } | z.string(),
        Tbsp: { amount: z.number(), unit: z.string() } | z.string(),
        AustralianTbsp: { amount: z.number(), unit: z.string() } | z.string(),
      },
    })
  ),
  instructions: z.array({
    instruction: z.string(),
    image: z.string(),
  }),
  description: z.string(),
  memoryImages: z.array(z.string()) | z.array(),
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
  recipes: z.array(recipeSchema).optional(),
});
