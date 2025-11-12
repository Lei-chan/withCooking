export type TYPE_MEDIA = "mobile" | "tablet" | "desktop" | "big";
export type TYPE_LANGUAGE = "en" | "ja";

export type TYPE_USER_CONTEXT = {
  accessToken: string;
  numberOfRecipes: number;
  isMessageVisible: boolean;
  firstLogin: (accessToken: string, numberOfRecipes: number) => void;
  login: (accessToken: string) => void;
  logout: () => void;
  addNumberOfRecipes: () => void;
  reduceNumberOfRecipes: (deletedNumberOfRecipes: number) => void;
} | null;

export type TYPE_RECIPE = {
  _id?: string;
  favorite: boolean;
  mainImage: TYPE_FILE | undefined;
  mainImagePreview?: TYPE_FILE | undefined;
  title: string;
  author: string;
  servings: { servings: number; unit: string; customUnit: string };
  temperatures: { temperatures: number[]; unit: "℉" | "℃" };
  ingredients: TYPE_INGREDIENTS;
  preparation: string;
  instructions: {
    instruction: string;
    image: TYPE_FILE | undefined;
  }[];
  description: string;
  memoryImages: TYPE_FILE[] | [];
  comments: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TYPE_RECIPE_LINK = {
  _id?: string;
  title: string;
  favorite: boolean;
  link: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TYPE_INSTRUCTION = {
  instruction: string;
  image: TYPE_FILE | undefined;
};

export type TYPE_INGREDIENTS = TYPE_INGREDIENT[] | [];

export type TYPE_INGREDIENT = {
  ingredient: string;
  amount: number;
  unit: string;
  id: number | undefined;
  convertion: {
    original: { amount: number; unit: string };
    metric: { amount: number; unit: string } | undefined;
    us: { amount: number; unit: string } | undefined;
    japan: { amount: number; unit: string } | undefined;
    australia: { amount: number; unit: string } | undefined;
    metricCup: { amount: number; unit: string } | undefined;
    g: { amount: number; unit: string } | undefined;
    kg: { amount: number; unit: string } | undefined;
    oz: { amount: number; unit: string } | undefined;
    lb: { amount: number; unit: string } | undefined;
    ml: { amount: number; unit: string } | undefined;
    L: { amount: number; unit: string } | undefined;
    usCup: { amount: number; unit: string } | undefined;
    japaneseCup: { amount: number; unit: string } | undefined;
    imperialCup: { amount: number; unit: string } | undefined;
    riceCup: { amount: number; unit: string } | undefined;
    tsp: { amount: number; unit: string } | undefined;
    tbsp: { amount: number; unit: string } | undefined;
    australianTbsp: { amount: number; unit: string } | undefined;
  };
};

export type TYPE_INGREDIENT_UNIT =
  | "noUnit"
  | "other"
  | "g"
  | "kg"
  | "oz"
  | "lb"
  | "ml"
  | "L"
  | "usCup"
  | "japaneseCup"
  | "imperialCup"
  | "riceCup"
  | "tsp"
  | "tbsp"
  | "australianTbsp"
  | "pinch"
  | "can"
  | "slice";

export type TYPE_REGION_UNIT =
  | "original"
  | "metric"
  | "us"
  | "japan"
  | "australia"
  | "metricCup";

export type TYPE_SERVINGS_UNIT =
  | "people"
  | "slices"
  | "pieces"
  | "cups"
  | "bowls"
  | "other";

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
