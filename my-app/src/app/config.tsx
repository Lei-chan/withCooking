export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MIN_UPPERCASE = 1;
export const PASSWORD_MIN_LOWERCASE = 1;
export const PASSWORD_MIN_DIGIT = 1;

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

export type TYPE_RECIPE = {
  id: string;
  favorite: boolean;
  mainImage: string;
  title: string;
  author: string;
  servings: { servings: number; unit: string };
  temperatures: { temperatures: number[]; unit: string };
  ingredients: {
    ingredient: string;
    amount: number | string;
    unit: string;
    id: number;
    convertion: object;
  }[];
  instructions: {
    instruction: string;
    image: string;
  }[];
  description: string;
  memoryImages: string[] | [];
  comments: string;
};

//for dev
export const accountInfo = {
  id: "khskhju9393&83u",
  email: "jskss@kks",
  since: "2025/10/05",
};
