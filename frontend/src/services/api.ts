/**
 * API Service для работы с бэкендом
 */

// Базовый URL API
// Expo приложение работает в браузере/на устройстве, поэтому не может использовать Docker DNS
// Используем localhost или IP хоста
const getApiBaseUrl = () => {
  // EXPO_PUBLIC_* переменные доступны в клиентском коде
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Для локальной разработки используем localhost
  // На iOS симуляторе: localhost работает
  // На Android эмуляторе: нужно использовать 10.0.2.2
  // На физическом устройстве: нужно использовать IP компьютера
  const defaultUrl = 'http://localhost:8000';
  console.log('Using default API URL:', defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('API_BASE_URL configured as:', API_BASE_URL);

export interface Ingredient {
  id: number;
  recipe_id: number;
  name: string;
  amount: string;
  unit: string;
  order: number;
}

export interface Step {
  id: number;
  recipe_id: number;
  number: number;
  instruction: string;
  image?: string;
  order: number;
}

export interface Review {
  id: number;
  recipe_id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

export interface Recipe {
  id: number;
  title: string;
  category: string;
  cook_time: number;
  servings: number;
  image?: string;
  calories_per_serving?: number;
  rating?: number;
  ingredients: Ingredient[];
  steps: Step[];
  reviews?: Review[];
}

export interface RecipeListItem {
  id: number;
  title: string;
  category: string;
  cook_time: number;
  servings: number;
  image?: string;
  calories_per_serving?: number;
  rating?: number;
}

export interface MenuPlan {
  id: number;
  date: string;
  user_id?: string;
  breakfast_recipe_id?: number;
  lunch_recipe_id?: number;
  dinner_recipe_id?: number;
  extra_recipe_id?: number;
  breakfast_recipe?: RecipeListItem;
  lunch_recipe?: RecipeListItem;
  dinner_recipe?: RecipeListItem;
  extra_recipe?: RecipeListItem;
  additional_recipes?: RecipeListItem[];
}

export interface ReviewCreate {
  author: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

export interface MenuPlanCreate {
  date: string;
  user_id?: string;
  breakfast_recipe_id?: number;
  lunch_recipe_id?: number;
  dinner_recipe_id?: number;
  extra_recipe_id?: number;
  additional_recipe_ids?: number[];
}

export interface UserIngredient {
  id: number;
  user_id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface UserIngredientCreate {
  name: string;
  quantity: number;
  price: number;
  user_id?: string;
}

/**
 * Обработка ошибок API
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

/**
 * Получить список рецептов
 */
export async function getRecipes(
  category?: string,
  search?: string
): Promise<RecipeListItem[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  const url = `${API_BASE_URL}/api/recipes${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  return handleResponse<RecipeListItem[]>(response);
}

/**
 * Получить детали рецепта по ID
 */
export async function getRecipe(recipeId: number): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`);
  return handleResponse<Recipe>(response);
}

/**
 * Добавить отзыв к рецепту
 */
export async function addReview(
  recipeId: number,
  review: ReviewCreate
): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });
  return handleResponse<Review>(response);
}

/**
 * Получить меню планы
 */
export async function getMenuPlans(
  startDate?: string,
  endDate?: string
): Promise<MenuPlan[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `${API_BASE_URL}/api/menu-plans${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  return handleResponse<MenuPlan[]>(response);
}

/**
 * Сохранить меню план (создать или обновить)
 */
export async function saveMenuPlan(menuPlan: MenuPlanCreate): Promise<MenuPlan> {
  const response = await fetch(`${API_BASE_URL}/api/menu-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuPlan),
  });
  return handleResponse<MenuPlan>(response);
}

/**
 * Удалить меню план по дате
 */
export async function deleteMenuPlan(date: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/menu-plans/${date}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
}

/**
 * Получить ингредиенты пользователя
 */
export async function getUserIngredients(userId: string = 'default'): Promise<UserIngredient[]> {
  const response = await fetch(`${API_BASE_URL}/api/user-ingredients?user_id=${userId}`);
  return handleResponse<UserIngredient[]>(response);
}

/**
 * Сохранить ингредиент пользователя
 */
export async function saveUserIngredient(ingredient: UserIngredientCreate): Promise<UserIngredient> {
  const response = await fetch(`${API_BASE_URL}/api/user-ingredients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ingredient),
  });
  return handleResponse<UserIngredient>(response);
}

/**
 * Сохранить несколько ингредиентов пользователя
 */
export async function saveUserIngredientsBatch(
  ingredients: UserIngredientCreate[],
  userId: string = 'default'
): Promise<UserIngredient[]> {
  const response = await fetch(`${API_BASE_URL}/api/user-ingredients/batch?user_id=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ingredients),
  });
  return handleResponse<UserIngredient[]>(response);
}

/**
 * Удалить ингредиент пользователя
 */
export async function deleteUserIngredient(name: string, userId: string = 'default'): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/user-ingredients/${encodeURIComponent(name)}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
}

