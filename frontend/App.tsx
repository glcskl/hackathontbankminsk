import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
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

const initialRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Американские панкейки',
    category: 'Завтрак',
    cookTime: 20,
    servings: 4,
    caloriesPerServing: 220,
    image: 'https://images.unsplash.com/photo-1637533114107-1dc725c6e576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5jYWtlcyUyMGJyZWFrZmFzdHxlbnwxfHx8fDE3NjM3NTU1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Мука', amount: '200', unit: 'г' },
      { name: 'Молоко', amount: '250', unit: 'мл' },
      { name: 'Яйца', amount: '2', unit: 'шт' },
      { name: 'Сахар', amount: '2', unit: 'ст.л.' },
      { name: 'Разрыхлитель', amount: '1', unit: 'ч.л.' },
      { name: 'Соль', amount: '0.5', unit: 'ч.л.' },
      { name: 'Сливочное масло', amount: '30', unit: 'г' }
    ],
    steps: [
      { 
        number: 1, 
        instruction: 'В большой миске смешайте муку, сахар, разрыхлитель и соль.',
        ingredients: ['Мука', 'Сахар', 'Разрыхлитель', 'Соль'],
        image: 'https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhpbmclMjBmbG91ciUyMGluZ3JlZGllbnRzfGVufDF8fHx8MTc2MzgwNzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      { 
        number: 2, 
        instruction: 'В отдельной миске взбейте яйца с молоком.',
        ingredients: ['Яйца', 'Молоко']
      },
      { 
        number: 3, 
        instruction: 'Растопите сливочное масло и дайте ему немного остыть.',
        ingredients: ['Сливочное масло']
      },
      { 
        number: 4, 
        instruction: 'Смешайте жидкие ингредиенты с сухими, добавьте растопленное масло. Не перемешивайте слишком долго - небольшие комочки допустимы.'
      },
      { 
        number: 5, 
        instruction: 'Разогрейте сковороду на среднем огне, слегка смажьте маслом.'
      },
      { 
        number: 6, 
        instruction: 'Выливайте тесто порциями и жарьте до появления пузырьков на поверхности, затем переверните и жарьте еще 1-2 минуты.',
        image: 'https://images.unsplash.com/photo-1740836257337-0d4fd26db36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5jYWtlcyUyMGNvb2tpbmclMjBwcm9jZXNzfGVufDF8fHx8MTc2MzgwNzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      }
    ],
    rating: 4.5,
    reviews: [
      {
        id: 'r1',
        author: 'Анна',
        rating: 5,
        comment: 'Отличный рецепт! Панкейки получились очень пышными и вкусными. Вся семья в восторге!',
        date: '15 ноя 2024'
      },
      {
        id: 'r2',
        author: 'Михаил',
        rating: 4,
        comment: 'Хороший рецепт, но я добавил немного ванили для аромата. Рекомендую!',
        date: '10 ноя 2024'
      }
    ]
  },
  {
    id: '2',
    title: 'Паста Болоньезе',
    category: 'Обед',
    cookTime: 45,
    servings: 4,
    caloriesPerServing: 520,
    image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGJvbG9nbmVzZXxlbnwxfHx8fDE3NjM3NzI0MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Спагетти', amount: '400', unit: 'г' },
      { name: 'Говяжий фарш', amount: '500', unit: 'г' },
      { name: 'Лук репчатый', amount: '1', unit: 'шт' },
      { name: 'Морковь', amount: '1', unit: 'шт' },
      { name: 'Томаты в собственном соку', amount: '400', unit: 'г' },
      { name: 'Томатная паста', amount: '2', unit: 'ст.л.' },
      { name: 'Чеснок', amount: '3', unit: 'зубчика' },
      { name: 'Оливковое масло', amount: '3', unit: 'ст.л.' },
      { name: 'Базилик сушеный', amount: '1', unit: 'ч.л.' },
      { name: 'Соль и перец', amount: 'по', unit: 'вкусу' }
    ],
    steps: [
      { 
        number: 1, 
        instruction: 'Мелко нарежьте лук, морковь и чеснок.',
        ingredients: ['Лук репчатый', 'Морковь', 'Чеснок']
      },
      { 
        number: 2, 
        instruction: 'Разогрейте оливковое масло в большой сковороде, обжарьте лук до прозрачности.',
        ingredients: ['Оливковое масло', 'Лук репчатый']
      },
      { 
        number: 3, 
        instruction: 'Добавьте морковь и чеснок, жарьте еще 3 минуты.',
        ingredients: ['Морковь', 'Чеснок']
      },
      { 
        number: 4, 
        instruction: 'Добавьте фарш, разбивая комочки. Жарьте до румяности около 10 минут.',
        ingredients: ['Говяжий фарш']
      },
      { 
        number: 5, 
        instruction: 'Добавьте томаты, томатную пасту, базилик, соль и перец. Тушите на медленном огне 20-25 минут.',
        ingredients: ['Томаты в собственном соку', 'Томатная паста', 'Базилик сушеный', 'Соль и перец'],
        image: 'https://images.unsplash.com/photo-1612078960243-177e68303e7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwcGFzdElMjBzYXVjZXxlbnwxfHx8fDE3NjM4MDc2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      { 
        number: 6, 
        instruction: 'Отварите спагетти согласно инструкции на упаковке. Смешайте с соусом и подавайте.',
        ingredients: ['Спагетти']
      }
    ]
  },
  {
    id: '3',
    title: 'Омлет с овощами',
    category: 'Завтрак',
    cookTime: 15,
    servings: 2,
    caloriesPerServing: 180,
    image: 'https://images.unsplash.com/photo-1668283653825-37b80f055b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVsZXR0ZSUyMGVnZ3N8ZW58MXx8fHwxNjM4MDM4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Яйца', amount: '4', unit: 'шт' },
      { name: 'Молоко', amount: '50', unit: 'мл' },
      { name: 'Болгарский перец', amount: '1', unit: 'шт' },
      { name: 'Помидор', amount: '1', unit: 'шт' },
      { name: 'Зеленый лук', amount: '2', unit: 'стебля' },
      { name: 'Сливочное масло', amount: '20', unit: 'г' },
      { name: 'Соль и перец', amount: 'по', unit: 'вкусу' }
    ],
    steps: [
      { number: 1, instruction: 'Нарежьте перец и помидор кубиками, зеленый лук мелко нашинкуйте.', ingredients: ['Болгарский перец', 'Помидор', 'Зеленый лук'] },
      { number: 2, instruction: 'Взбейте яйца с молоком, солью и перцем до однородности.', ingredients: ['Яйца', 'Молоко'] },
      { number: 3, instruction: 'Растопите масло на сковороде, обжарьте перец 2-3 минуты.', ingredients: ['Сливочное масло', 'Болгарский перец'] },
      { number: 4, instruction: 'Добавьте помидор, жарьте еще 1 минуту.', ingredients: ['Помидор'] },
      { number: 5, instruction: 'Залейте овощи яичной смесью, посыпьте зеленым луком.' },
      { number: 6, instruction: 'Готовьте на среднем огне под крышкой 5-7 минут до готовности.' }
    ]
  },
  {
    id: '4',
    title: 'Лосось на гриле',
    category: 'Ужин',
    cookTime: 25,
    servings: 2,
    caloriesPerServing: 350,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9ufGVufDF8fHx8MTc2MzcwMzYyOXww&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Филе лосося', amount: '400', unit: 'г' },
      { name: 'Лимон', amount: '1', unit: 'шт' },
      { name: 'Оливковое масло', amount: '2', unit: 'ст.л.' },
      { name: 'Чеснок', amount: '2', unit: 'зубчика' },
      { name: 'Свежий укроп', amount: '3', unit: 'веточки' },
      { name: 'Соль и перец', amount: 'по', unit: 'вкусу' }
    ],
    steps: [
      { number: 1, instruction: 'Смешайте оливковое масло, сок половины лимона, измельченный чеснок, соль и перец.', ingredients: ['Оливковое масло', 'Лимон', 'Чеснок'] },
      { number: 2, instruction: 'Замаринуйте филе лосося в этой смеси на 15 минут.', ingredients: ['Филе лосося'] },
      { number: 3, instruction: 'Разогрейте гриль или сковороду-гриль на среднем огне.' },
      { number: 4, instruction: 'Выложите лосось кожей вниз и жарьте 4-5 минут.', image: 'https://images.unsplash.com/photo-1589236103748-2077d3435dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9uJTIwY29va2luZ3xlbnwxfHx8fDE3NjM4MDc2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { number: 5, instruction: 'Переверните и жарьте еще 3-4 минуты до готовности.' },
      { number: 6, instruction: 'Подавайте с дольками лимона и свежим укропом.', ingredients: ['Лимон', 'Свежий укроп'] }
    ]
  },
  {
    id: '5',
    title: 'Салат Цезарь',
    category: 'Обед',
    cookTime: 20,
    servings: 2,
    caloriesPerServing: 380,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZHxlbnwxfHx8fDE3NjM3NzMyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Салат Романо', amount: '1', unit: 'кочан' },
      { name: 'Куриное филе', amount: '300', unit: 'г' },
      { name: 'Пармезан', amount: '50', unit: 'г' },
      { name: 'Белый хлеб', amount: '3', unit: 'ломтика' },
      { name: 'Чеснок', amount: '2', unit: 'зубчика' },
      { name: 'Майонез', amount: '4', unit: 'ст.л.' },
      { name: 'Горчица', amount: '1', unit: 'ч.л.' },
      { name: 'Лимонный сок', amount: '1', unit: 'ст.л.' },
      { name: 'Оливковое масло', amount: '3', unit: 'ст.л.' }
    ],
    steps: [
      { number: 1, instruction: 'Обжарьте куриное филе до готовности, нарежьте кубиками.', ingredients: ['Куриное филе'] },
      { number: 2, instruction: 'Нарежьте хлеб кубиками, смешайте с измельченным чесноком и оливковым маслом.', ingredients: ['Белый хлеб', 'Чеснок', 'Оливковое масло'] },
      { number: 3, instruction: 'Обжарьте хлеб до золотистых сухариков.' },
      { number: 4, instruction: 'Приготовьте соус: смешайте майонез, горчицу, лимонный сок и измельченный чеснок.', ingredients: ['Майонез', 'Горчица', 'Лимонный сок'] },
      { number: 5, instruction: 'Порвите салат руками, добавьте курицу и сухарики.', ingredients: ['Салат Романо'] },
      { number: 6, instruction: 'Заправьте соусом, посыпьте тертым пармезаном и подавайте.', ingredients: ['Пармезан'] }
    ]
  },
  {
    id: '6',
    title: 'Шоколадный торт',
    category: 'Десерт',
    cookTime: 60,
    servings: 8,
    caloriesPerServing: 450,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlfGVufDF8fHx8MTc2MzcxMjQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Мука', amount: '200', unit: 'г' },
      { name: 'Сахар', amount: '200', unit: 'г' },
      { name: 'Какао-порошок', amount: '50', unit: 'г' },
      { name: 'Яйца', amount: '3', unit: 'шт' },
      { name: 'Молоко', amount: '120', unit: 'мл' },
      { name: 'Растительное масло', amount: '80', unit: 'мл' },
      { name: 'Разрыхлитель', amount: '2', unit: 'ч.л.' },
      { name: 'Ванильный экстракт', amount: '1', unit: 'ч.л.' },
      { name: 'Темный шоколад', amount: '200', unit: 'г' },
      { name: 'Сливки 33%', amount: '200', unit: 'мл' }
    ],
    steps: [
      { number: 1, instruction: 'Разогрейте духовку до 180°C. Смажьте форму маслом.' },
      { number: 2, instruction: 'Смешайте муку, какао, разрыхлитель и половину сахара.', ingredients: ['Мука', 'Какао-порошок', 'Разрыхлитель', 'Сахар'] },
      { number: 3, instruction: 'Взбейте яйца с оставшимся сахаром до пышности.', ingredients: ['Яйца', 'Сахар'] },
      { number: 4, instruction: 'Добавьте молоко, масло и ванильный экстракт к яйцам.', ingredients: ['Молоко', 'Растительное масло', 'Ванильный экстракт'] },
      { number: 5, instruction: 'Соедините жидкие и сухие ингредиенты, перемешайте до однородности.' },
      { number: 6, instruction: 'Выпекайте 30-35 минут. Для глазури растопите шоколад со сливками, охладите и покройте остывший торт.', ingredients: ['Темный шоколад', 'Сливки 33%'] }
    ]
  }
];

const categories = ['Все', 'Завтрак', 'Обед', 'Ужин', 'Десерт'];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'recipes' | 'menu' | 'ingredients' | 'shopping'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [userIngredients, setUserIngredients] = useState<Map<string, { quantity: number; price: number }>>(new Map());
  const [menuPlan, setMenuPlan] = useState<Record<string, MealPlan>>({});

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = activeCategory === 'Все' || recipe.category === activeCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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

  const handleAddReview = (recipeId: string, rating: number, comment: string, image?: string) => {
    const newReview: Review = {
      id: `r${Date.now()}`,
      author: 'Пользователь',
      rating,
      comment,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
      image
    };
    
    setRecipes(prev => prev.map(recipe => {
      if (recipe.id === recipeId) {
        const updatedReviews = [...(recipe.reviews || []), newReview];
        const averageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        
        const updatedRecipe = {
          ...recipe,
          reviews: updatedReviews,
          rating: averageRating
        };
        
        if (selectedRecipe && selectedRecipe.id === recipeId) {
          setSelectedRecipe(updatedRecipe);
        }
        
        return updatedRecipe;
      }
      return recipe;
    }));
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

            <View style={styles.recipesGrid}>
              {filteredRecipes.map((recipe) => (
                <View key={recipe.id} style={styles.recipeCardWrapper}>
                  <RecipeCard 
                    {...recipe}
                    onClick={() => setSelectedRecipe(recipe)}
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
          <MonthlyMenu recipes={recipes} onMenuPlanChange={setMenuPlan} />
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
});
