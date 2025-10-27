export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MIN_UPPERCASE = 1;
export const PASSWORD_MIN_LOWERCASE = 1;
export const PASSWORD_MIN_DIGIT = 1;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const NUMBER_OF_TEMPERATURES = 4;
export const MAX_SERVINGS = 999;
export const SLIDE_TRANSITION_SEC = 4;
export const MESSAGE_TIMEOUT = 4; //seconds

export const APP_EXPLANATIONS = [
  {
    title: "Create recipes",
    image: "/grey-img.png",
    explanation:
      "You can create recipes with simple steps. Nutritional information is automatically created for your recipes, so it's useful to manage your diet. You can also automatically convert ingredients/temperature units to various types of units, so you don't need to look up for different units on the Internet anymore!",
  },
  {
    title: "Search recipes",
    image: "/grey-img.png",
    explanation: "You can search your recipes using keywords.",
  },
  {
    title: "Cook with recipes",
    image: "/grey-img.png",
    explanation:
      "You can edit and leave comments for recipes while cooking, so whenever you want to change your recipes, you can easily manage it.",
  },
  {
    title: "Set multiple timers",
    image: "/grey-img.png",
    explanation:
      " You can edit and leave comments for recipes while cooking, so whenever you want to change your recipes, you can easily manage it.",
  },
];
