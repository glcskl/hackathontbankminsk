import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
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
import { CreateRecipe } from './src/components/CreateRecipe';
import { colors } from './src/constants/colors';
import { Recipe, Review, MealPlan } from './src/types';
import * as api from './src/services/api';

const categories = ['Все', 'Мои рецепты', 'Завтрак', 'Обед', 'Ужин', 'Десерт'];

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
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);

  // Загрузка рецептов при монтировании и при изменении фильтров
  useEffect(() => {
    loadRecipes();
  }, [activeCategory, searchQuery]);

  // Загружаем полные данные рецептов при открытии вкладки ингредиентов
  useEffect(() => {
    if (activeTab === 'ingredients' && recipes.length > 0) {
      loadFullRecipesForIngredients();
    }
  }, [activeTab]);

  // Загрузка меню планов при монтировании и при переключении на вкладку меню
  useEffect(() => {
    loadMenuPlans();
  }, []);

  // Перезагружаем меню планы при открытии вкладки меню
  useEffect(() => {
    if (activeTab === 'menu') {
      loadMenuPlans();
    }
  }, [activeTab]);

  // Загрузка ингредиентов пользователя при монтировании
  useEffect(() => {
    loadUserIngredients();
  }, []);

  const loadUserIngredients = async () => {
    try {
      const apiIngredients = await api.getUserIngredients('default');
      const ingredientsMap = new Map<string, { quantity: number; price: number }>();
      apiIngredients.forEach(ing => {
        ingredientsMap.set(ing.name, { quantity: ing.quantity, price: ing.price });
      });
      setUserIngredients(ingredientsMap);
    } catch (err) {
      console.error('Error loading user ingredients:', err);
      // Не показываем ошибку пользователю
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      let category = activeCategory === 'Все' ? undefined : activeCategory;
      const userId = activeCategory === 'Мои рецепты' ? 'default' : undefined;
      if (activeCategory === 'Мои рецепты') {
        category = undefined;
      }
      const search = searchQuery.trim() || undefined;
      const apiRecipes = await api.getRecipes(category, search, userId);
      const adaptedRecipes = apiRecipes.map(adaptApiRecipeListItemToFrontend);
      setRecipes(adaptedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки рецептов');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFullRecipesForIngredients = async () => {
    try {
      // Проверяем, нужно ли загружать полные данные
      const needsFullData = recipes.some(recipe => !recipe.ingredients || recipe.ingredients.length === 0);
      if (!needsFullData) return;

      // Загружаем полные данные для рецептов без ингредиентов
      const recipesToLoad = recipes.filter(recipe => !recipe.ingredients || recipe.ingredients.length === 0);
      const fullRecipes = await Promise.all(
        recipesToLoad.map(async (recipe) => {
          try {
            const fullRecipe = await api.getRecipe(Number(recipe.id));
            return adaptApiRecipeToFrontend(fullRecipe);
          } catch (err) {
            console.error(`Error loading full recipe ${recipe.id}:`, err);
            return recipe; // Возвращаем оригинальный рецепт при ошибке
          }
        })
      );

      // Обновляем рецепты с полными данными
      setRecipes(prevRecipes => {
        const updatedRecipes = [...prevRecipes];
        fullRecipes.forEach(fullRecipe => {
          const index = updatedRecipes.findIndex(r => r.id === fullRecipe.id);
          if (index !== -1) {
            updatedRecipes[index] = fullRecipe;
          }
        });
        return updatedRecipes;
      });
    } catch (err) {
      console.error('Error loading full recipes for ingredients:', err);
    }
  };

  const loadMenuPlans = async () => {
    try {
      const apiMenuPlans = await api.getMenuPlans();
      const adaptedMenuPlans: Record<string, MealPlan> = {};
      
      // Загружаем полные данные рецептов с ингредиентами
      const loadFullRecipe = async (recipeListItem: api.RecipeListItem | undefined): Promise<Recipe | undefined> => {
        if (!recipeListItem) return undefined;
        try {
          const fullRecipe = await api.getRecipe(recipeListItem.id);
          return adaptApiRecipeToFrontend(fullRecipe);
        } catch (err) {
          console.error(`Error loading full recipe ${recipeListItem.id}:`, err);
          // Если не удалось загрузить полные данные, используем базовую информацию
          return adaptApiRecipeListItemToFrontend(recipeListItem);
        }
      };
      
      // Загружаем все рецепты параллельно
      for (const plan of apiMenuPlans) {
        const dateKey = plan.date;
        
        const [breakfast, lunch, dinner, extra, ...additional] = await Promise.all([
          loadFullRecipe(plan.breakfast_recipe),
          loadFullRecipe(plan.lunch_recipe),
          loadFullRecipe(plan.dinner_recipe),
          loadFullRecipe(plan.extra_recipe),
          ...(plan.additional_recipes || []).map(recipe => loadFullRecipe(recipe))
        ]);
        
        adaptedMenuPlans[dateKey] = {
          breakfast,
          lunch,
          dinner,
          extra,
          additional: additional.filter((r): r is Recipe => r !== undefined)
        };
      }
      
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
        const additionalRecipeIds = plan.additional?.map(r => Number(r.id)).filter(id => !isNaN(id)) || [];
        await api.saveMenuPlan({
          date,
          breakfast_recipe_id: plan.breakfast?.id ? Number(plan.breakfast.id) : undefined,
          lunch_recipe_id: plan.lunch?.id ? Number(plan.lunch.id) : undefined,
          dinner_recipe_id: plan.dinner?.id ? Number(plan.dinner.id) : undefined,
          extra_recipe_id: plan.extra?.id ? Number(plan.extra.id) : undefined,
          additional_recipe_ids: additionalRecipeIds.length > 0 ? additionalRecipeIds : undefined,
        });
      }
    } catch (err) {
      console.error('Error saving menu plan:', err);
      // Не показываем ошибку пользователю, изменения уже применены локально
    }
  };

  // Фильтрация теперь происходит на бэкенде, но оставляем для совместимости
  const filteredRecipes = recipes;

  const handleUpdateIngredient = async (ingredient: string, quantity: number, price: number) => {
    setUserIngredients(prev => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(ingredient);
      } else {
        newMap.set(ingredient, { quantity, price });
      }
      return newMap;
    });

    // Сохраняем в БД
    try {
      if (quantity === 0) {
        await api.deleteUserIngredient(ingredient, 'default');
      } else {
        await api.saveUserIngredient({
          name: ingredient,
          quantity,
          price,
          user_id: 'default'
        });
      }
    } catch (err) {
      console.error('Error saving user ingredient:', err);
      // Не показываем ошибку пользователю, изменения уже применены локально
    }
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

            <View style={styles.headerRow}>
              <Text style={styles.recipesCount}>
                Найдено рецептов: <Text style={styles.recipesCountBold}>{filteredRecipes.length}</Text>
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateRecipe(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

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
          <MonthlyMenu recipes={recipes} menuPlan={menuPlan} onMenuPlanChange={handleMenuPlanChange} />
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

      <CreateRecipe
        visible={showCreateRecipe}
        onClose={() => setShowCreateRecipe(false)}
        onSuccess={() => {
          loadRecipes();
        }}
      />

      <View style={styles.bottomNavigationContainer}>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  bottomNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: colors.grayBg,
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  searchContainer: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipesCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recipesCountBold: {
    color: colors.black,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
