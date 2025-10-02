export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MIN_UPPERCASE = 1;
export const PASSWORD_MIN_LOWERCASE = 1;
export const PASSWORD_MIN_DIGIT = 1;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const NUMBER_OF_TEMPERATURES = 4;
export const MAX_SERVINGS = 999;

export const APP_EXPLANATIONS = [
  {
    title: "Create recipes",
    image: "",
    explanation:
      "You can create recipes with simple steps. Nutritional information is automatically created for your recipes, so it's useful to manage your diet. You can also automatically convert ingredients/temperature units to various types of units, so you don't need to look up for different units on the Internet anymore!",
  },
  {
    title: "Search recipes",
    image: "",
    explanation: "You can search your recipes using keywords.",
  },
  {
    title: "Cook with recipes",
    image: "",
    explanation:
      "You can edit and leave comments for recipes while cooking, so whenever you want to change your recipes, you can easily manage it.",
  },
  {
    title: "Set multiple timers",
    image: "",
    explanation:
      " You can edit and leave comments for recipes while cooking, so whenever you want to change your recipes, you can easily manage it.",
  },
];

export const MESSAGE_TIMEOUT = 3; //seconds

export type TYPE_RECIPE = {
  // id: string;
  favorite: boolean;
  region: "metric" | "us" | "japan" | "australia" | "metricCup";
  mainImage: TYPE_FILE | undefined;
  title: string;
  author: string;
  servings: { servings: number; unit: string; customUnit: string };
  temperatures: { temperatures: number[]; unit: "℉" | "℃" };
  ingredients: TYPE_INGREDIENTS;
  instructions: {
    instruction: string;
    image: TYPE_FILE | undefined;
  }[];
  description: string;
  memoryImages: TYPE_FILE[] | [];
  comments: string;
};

export type TYPE_FILE = {
  data: string;
  contentType: string;
  filename: string;
  fileSize: number;
};

export type TYPE_CONVERTED_FILE = {
  fileId: any;
  filename: string;
  contentType: string;
  fileSize: number;
  uploadedAt: Date;
};

export type TYPE_INSTRUCTION = {
  instruction: string;
  image: TYPE_FILE | undefined;
};

export type TYPE_INGREDIENTS = TYPE_INGREDIENT[];

export type TYPE_INGREDIENT = {
  ingredient: string;
  amount: number;
  unit: string;
  customUnit: string;
  id: number | undefined;
  convertion:
    | {
        metric: { amount: number; unit: string } | undefined;
        us: { amount: number; unit: string } | undefined;
        japan:
          | { amount: number; unit: string }
          // | {
          //     cupJapan: { amount: number; unit: string };
          //     riceCup: { amount: number; unit: string };
          //   }
          | undefined;
        australia: { amount: number; unit: string } | undefined;
        metricCup: { amount: number; unit: string } | undefined;
        g: { amount: number; unit: string } | undefined;
        kg: { amount: number; unit: string } | undefined;
        oz: { amount: number; unit: string } | undefined;
        lb: { amount: number; unit: string } | undefined;
        ml: { amount: number; unit: string } | undefined;
        L: { amount: number; unit: string } | undefined;
        USCup: { amount: number; unit: string } | undefined;
        JapaneseCup: { amount: number; unit: string } | undefined;
        ImperialCup: { amount: number; unit: string } | undefined;
        riceCup: { amount: number; unit: string } | undefined;
        tsp: { amount: number; unit: string } | undefined;
        Tbsp: { amount: number; unit: string } | undefined;
        AustralianTbsp: { amount: number; unit: string } | undefined;
      }
    | undefined;
};
