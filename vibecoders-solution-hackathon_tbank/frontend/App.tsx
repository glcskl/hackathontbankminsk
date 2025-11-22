import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RecipeCard } from './src/components/RecipeCard';
import { CategoryFilter } from './src/components/CategoryFilter';
import { RecipeDetail } from './src/components/RecipeDetail';
import { TabNavigation } from './src/components/TabNavigation';
import { MonthlyMenu } from './src/components/MonthlyMenu';
import { SearchBar } from './src/components/SearchBar';
import { IngredientsTab } from './src/components/IngredientsTab';
import { ShoppingListTab } from './src/components/ShoppingListTab';
import { colors } from './src/constants/colors';
import { Recipe, Review, MealPlan } from './src/types';
import * as api from './src/services/api';

const categories = ['Все', 'Завтрак', 'Обед', 'Ужин', 'Десерт'];

// Адаптеры для преобразования данных между API и фронтендом
function adaptApiRecipeToFrontend(apiRecipe: api.Recipe): Recipe {
  return {
    id: String(apiRecipe.id),
    title: apiRecipe.title,
    category: apiRecipe.category,
    cookTime: apiRecipe.cook_time,
    servings: apiRecipe.servings,
    image: apiRecipe.image || '',
    caloriesPerServing: apiRecipe.calories_per_serving,
    rating: apiRecipe.rating,
    ingredients: apiRecipe.ingredients.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit
    })),
    steps: apiRecipe.steps.map(step => ({
      number: step.number,
      instruction: step.instruction,
      image: step.image,
      ingredients: [] // API не возвращает ingredients для steps
    })),
    reviews: apiRecipe.reviews?.map(review => ({
      id: String(review.id),
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      image: review.image
    })) || []
  };
}

function adaptApiRecipeListItemToFrontend(apiRecipe: api.RecipeListItem): Recipe {
  return {
    id: String(apiRecipe.id),
    title: apiRecipe.title,
    category: apiRecipe.category,
    cookTime: apiRecipe.cook_time,
    servings: apiRecipe.servings,
    image: apiRecipe.image || '',
    caloriesPerServing: apiRecipe.calories_per_serving,
    rating: apiRecipe.rating,
    ingredients: [],
    steps: [],
    reviews: []
  };
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'recipes' | 'menu' | 'ingredients' | 'shopping'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userIngredients, setUserIngredients] = useState<Map<string, { quantity: number; price: number }>>(new Map());
  const [menuPlan, setMenuPlan] = useState<Record<string, MealPlan>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка рецептов при монтировании и при изменении фильтров
  useEffect(() => {
    loadRecipes();
  }, [activeCategory, searchQuery]);

  // Загрузка меню планов при монтировании
  useEffect(() => {
    loadMenuPlans();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const category = activeCategory === 'Все' ? undefined : activeCategory;
      const search = searchQuery.trim() || undefined;
      const apiRecipes = await api.getRecipes(category, search);
      const adaptedRecipes = apiRecipes.map(adaptApiRecipeListItemToFrontend);
      setRecipes(adaptedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки рецептов');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuPlans = async () => {
    try {
      const apiMenuPlans = await api.getMenuPlans();
      const adaptedMenuPlans: Record<string, MealPlan> = {};
      
      apiMenuPlans.forEach(plan => {
        const dateKey = plan.date;
        adaptedMenuPlans[dateKey] = {
          breakfast: plan.breakfast_recipe ? adaptApiRecipeListItemToFrontend(plan.breakfast_recipe) : undefined,
          lunch: plan.lunch_recipe ? adaptApiRecipeListItemToFrontend(plan.lunch_recipe) : undefined,
          dinner: plan.dinner_recipe ? adaptApiRecipeListItemToFrontend(plan.dinner_recipe) : undefined,
          extra: plan.extra_recipe ? adaptApiRecipeListItemToFrontend(plan.extra_recipe) : undefined,
          additional: []
        };
      });
      
      setMenuPlan(adaptedMenuPlans);
    } catch (err) {
      console.error('Error loading menu plans:', err);
      // Не показываем ошибку пользователю, просто используем пустые планы
    }
  };

  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      // Загружаем полные детали рецепта
      const fullRecipe = await api.getRecipe(Number(recipe.id));
      const adaptedRecipe = adaptApiRecipeToFrontend(fullRecipe);
      setSelectedRecipe(adaptedRecipe);
    } catch (err) {
      console.error('Error loading recipe details:', err);
      // Если не удалось загрузить детали, используем базовую информацию
      setSelectedRecipe(recipe);
    }
  };

  const handleMenuPlanChange = async (newMenuPlan: Record<string, MealPlan>) => {
    setMenuPlan(newMenuPlan);
    
    // Сохраняем изменения в API
    try {
      for (const [date, plan] of Object.entries(newMenuPlan)) {
        await api.saveMenuPlan({
          date,
          breakfast_recipe_id: plan.breakfast?.id ? Number(plan.breakfast.id) : undefined,
          lunch_recipe_id: plan.lunch?.id ? Number(plan.lunch.id) : undefined,
          dinner_recipe_id: plan.dinner?.id ? Number(plan.dinner.id) : undefined,
          extra_recipe_id: plan.extra?.id ? Number(plan.extra.id) : undefined,
        });
      }
    } catch (err) {
      console.error('Error saving menu plan:', err);
      // Не показываем ошибку пользователю, изменения уже применены локально
    }
  };

  // Фильтрация теперь происходит на бэкенде, но оставляем для совместимости
  const filteredRecipes = recipes;

  const handleUpdateIngredient = (ingredient: string, quantity: number, price: number) => {
    setUserIngredients(prev => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(ingredient);
      } else {
        newMap.set(ingredient, { quantity, price });
      }
      return newMap;
    });
  };

  const handleAddReview = async (recipeId: string, rating: number, comment: string, image?: string) => {
    try {
      const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
      const apiReview = await api.addReview(Number(recipeId), {
        author: 'Пользователь',
        rating,
        comment,
        date,
        image
      });

      const newReview: Review = {
        id: String(apiReview.id),
        author: apiReview.author,
        rating: apiReview.rating,
        comment: apiReview.comment,
        date: apiReview.date,
        image: apiReview.image
      };

      // Обновляем рецепты в списке
      setRecipes(prev => prev.map(recipe => {
        if (recipe.id === recipeId) {
          const updatedReviews = [...(recipe.reviews || []), newReview];
          const averageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          
          return {
            ...recipe,
            reviews: updatedReviews,
            rating: averageRating
          };
        }
        return recipe;
      }));

      // Обновляем выбранный рецепт
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        const updatedReviews = [...(selectedRecipe.reviews || []), newReview];
        const averageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        
        setSelectedRecipe({
          ...selectedRecipe,
          reviews: updatedReviews,
          rating: averageRating
        });
      }

      // Перезагружаем рецепты для обновления рейтинга
      await loadRecipes();
    } catch (err) {
      console.error('Error adding review:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении отзыва');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="restaurant" size={28} color={colors.black} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>T-Meal</Text>
            <Text style={styles.headerSubtitle}>Планируйте меню и готовьте с удовольствием</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabNavigationContainer}>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <View style={styles.content}>
        {activeTab === 'recipes' ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.searchContainer}>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </View>

            <View style={styles.filterContainer}>
              <CategoryFilter 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </View>

            <Text style={styles.recipesCount}>
              Найдено рецептов: <Text style={styles.recipesCountBold}>{filteredRecipes.length}</Text>
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Загрузка рецептов...</Text>
              </View>
            ) : error ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.gray300} />
                <Text style={styles.emptyTitle}>Ошибка загрузки</Text>
                <Text style={styles.emptyText}>{error}</Text>
              </View>
            ) : (
              <>
                <View style={styles.recipesGrid}>
                  {filteredRecipes.map((recipe) => (
                    <View key={recipe.id} style={styles.recipeCardWrapper}>
                      <RecipeCard 
                        {...recipe}
                        onClick={() => handleRecipeClick(recipe)}
                      />
                    </View>
                  ))}
                </View>

                {filteredRecipes.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={64} color={colors.gray300} />
                    <Text style={styles.emptyTitle}>Рецепты не найдены</Text>
                    <Text style={styles.emptyText}>
                      Попробуйте изменить поисковый запрос или выбрать другую категорию
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        ) : activeTab === 'ingredients' ? (
          <IngredientsTab
            recipes={recipes}
            onRecipeClick={setSelectedRecipe}
            userIngredients={userIngredients}
            onUpdateIngredient={handleUpdateIngredient}
          />
        ) : activeTab === 'shopping' ? (
          <ShoppingListTab
            menuPlan={menuPlan}
            recipes={recipes}
            userIngredients={userIngredients}
          />
        ) : (
          <MonthlyMenu recipes={recipes} onMenuPlanChange={handleMenuPlanChange} />
        )}
      </View>

      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          userIngredients={userIngredients}
          onAddReview={handleAddReview}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  header: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabNavigationContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.grayBg,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  recipesCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  recipesCountBold: {
    color: colors.black,
    fontWeight: '600',
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipeCardWrapper: {
    width: '48%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
