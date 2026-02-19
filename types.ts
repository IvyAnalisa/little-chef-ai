
export interface Ingredient {
  item: string;
  amount: string;
}

export interface Step {
  stepNumber: number;
  instruction: string;
  tip?: string;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  servings: number;
  ingredients: Ingredient[];
  instructions: Step[];
  nutritionalInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

export interface SavedRecipe {
  id: string;
  recipe: Recipe;
  imageUrl: string | null;
  timestamp: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}

export interface AppState {
  ingredients: string[];
  dietaryRestrictions: string[];
  cookingTime: string;
  recipe: Recipe | null;
  isLoading: boolean;
  isGeneratingImage: boolean;
  foodImageUrl: string | null;
  error: string | null;
  savedRecipes: SavedRecipe[];
  shoppingList: ShoppingItem[];
  currentView: 'home' | 'saved' | 'shopping';
}
