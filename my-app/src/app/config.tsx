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
