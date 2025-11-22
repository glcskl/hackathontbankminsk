export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  number: number;
  instruction: string;
  ingredients?: string[];
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  cookTime: number;
  servings: number;
  image: string;
  ingredients: Ingredient[];
  steps: Step[];
  rating?: number;
  reviews?: Review[];
  caloriesPerServing?: number;
  proteinsPerServing?: number;
  fatsPerServing?: number;
  carbohydratesPerServing?: number;
}

export interface MealPlan {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  extra?: Recipe;
  additional?: Recipe[];
}

