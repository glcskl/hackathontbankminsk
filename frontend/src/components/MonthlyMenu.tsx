import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealSlot } from './MealSlot';
import { RecipeSelector } from './RecipeSelector';
import { colors } from '../constants/colors';
import { Recipe, MealPlan } from '../types';
import * as api from '../services/api';

interface MonthlyMenuProps {
  recipes: Recipe[];
  menuPlan?: Record<string, MealPlan>;
  onMenuPlanChange?: (menuPlan: Record<string, MealPlan>) => void;
}

export function MonthlyMenu({ recipes, menuPlan: initialMenuPlan = {}, onMenuPlanChange }: MonthlyMenuProps) {
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = текущая неделя, 1 = следующая
  const [menuPlan, setMenuPlan] = useState<Record<string, MealPlan>>(initialMenuPlan);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; mealType: keyof MealPlan | 'additional'; additionalIndex?: number } | null>(null);

  // Обновляем локальное состояние при изменении пропса
  useEffect(() => {
    setMenuPlan(initialMenuPlan);
  }, [initialMenuPlan]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getCurrentAndNextWeeks = () => {
    const weeks: Date[][] = [];
    
    // Находим понедельник текущей недели
    const todayDate = new Date(today);
    const dayOfWeek = (todayDate.getDay() + 6) % 7; // Понедельник = 0
    const mondayOfCurrentWeek = new Date(todayDate);
    mondayOfCurrentWeek.setDate(todayDate.getDate() - dayOfWeek);
    mondayOfCurrentWeek.setHours(0, 0, 0, 0);
    
    // Текущая неделя
    const currentWeek: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayOfCurrentWeek);
      date.setDate(mondayOfCurrentWeek.getDate() + i);
      currentWeek.push(date);
    }
    weeks.push(currentWeek);
    
    // Следующая неделя
    const nextWeek: Date[] = [];
    const mondayOfNextWeek = new Date(mondayOfCurrentWeek);
    mondayOfNextWeek.setDate(mondayOfCurrentWeek.getDate() + 7);
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayOfNextWeek);
      date.setDate(mondayOfNextWeek.getDate() + i);
      nextWeek.push(date);
    }
    weeks.push(nextWeek);
    
    return weeks;
  };

  const weeks = getCurrentAndNextWeeks();
  
  // Показываем все дни недели
  const currentWeekDays = weeks[currentWeek] || [];

  const getWeekDateRange = () => {
    if (currentWeekDays.length === 0) return '';
    const firstDay = currentWeekDays[0];
    const lastDay = currentWeekDays[currentWeekDays.length - 1];
    
    const firstMonth = monthNames[firstDay.getMonth()].slice(0, 3).toLowerCase();
    const lastMonth = monthNames[lastDay.getMonth()].slice(0, 3).toLowerCase();
    
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${firstDay.getDate()} — ${lastDay.getDate()} ${firstMonth}`;
    }
    return `${firstDay.getDate()} ${firstMonth} — ${lastDay.getDate()} ${lastMonth}`;
  };

  const handleAddMeal = (day: string, mealType: keyof MealPlan | 'additional', additionalIndex?: number) => {
    setSelectedSlot({ day, mealType, additionalIndex });
    setSelectorOpen(true);
  };

  const handleRemoveMeal = (day: string, mealType: keyof MealPlan | 'additional', additionalIndex?: number) => {
    setMenuPlan(prev => {
      const newPlan = { ...prev };
      if (newPlan[day]) {
        const dayPlan = { ...newPlan[day] };
        
        if (mealType === 'additional' && additionalIndex !== undefined) {
          const additional = [...(dayPlan.additional || [])];
          additional.splice(additionalIndex, 1);
          dayPlan.additional = additional.length > 0 ? additional : undefined;
        } else if (mealType !== 'additional') {
          delete dayPlan[mealType];
        }
        
        if (Object.keys(dayPlan).length === 0 || (Object.keys(dayPlan).length === 1 && dayPlan.additional?.length === 0)) {
          delete newPlan[day];
        } else {
          newPlan[day] = dayPlan;
        }
      }
      
      if (onMenuPlanChange) {
        onMenuPlanChange(newPlan);
      }
      
      return newPlan;
    });
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (selectedSlot) {
      // Если у рецепта нет ингредиентов, загружаем полные данные
      let fullRecipe = recipe;
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        try {
          const apiRecipe = await api.getRecipe(Number(recipe.id));
          fullRecipe = {
            ...recipe,
            caloriesPerServing: apiRecipe.calories_per_serving,
            proteinsPerServing: apiRecipe.proteins_per_serving,
            fatsPerServing: apiRecipe.fats_per_serving,
            carbohydratesPerServing: apiRecipe.carbohydrates_per_serving,
            ingredients: apiRecipe.ingredients.map(ing => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit
            })),
            steps: apiRecipe.steps.map(step => ({
              number: step.number,
              instruction: step.instruction,
              image: step.image,
              ingredients: []
            }))
          };
        } catch (err) {
          console.error('Error loading full recipe:', err);
          // Используем рецепт без ингредиентов, если не удалось загрузить
        }
      }
      
      setMenuPlan(prev => {
        const newPlan = { ...prev };
        const dayPlan = { ...newPlan[selectedSlot.day] };
        
        if (selectedSlot.mealType === 'additional') {
          const additional = [...(dayPlan.additional || [])];
          if (selectedSlot.additionalIndex !== undefined) {
            additional[selectedSlot.additionalIndex] = fullRecipe;
          } else {
            additional.push(fullRecipe);
          }
          dayPlan.additional = additional;
        } else {
          dayPlan[selectedSlot.mealType] = fullRecipe;
        }
        
        newPlan[selectedSlot.day] = dayPlan;
        
        if (onMenuPlanChange) {
          onMenuPlanChange(newPlan);
        }
        
        return newPlan;
      });
    }
    setSelectorOpen(false);
    setSelectedSlot(null);
  };

  const handleAddAdditionalMeal = (day: string) => {
    handleAddMeal(day, 'additional');
  };

  const getMealLabel = (mealType: keyof MealPlan | 'additional'): string => {
    const labels: Record<string, string> = {
      breakfast: 'Завтрак',
      lunch: 'Обед',
      dinner: 'Ужин',
      extra: 'Десерт',
      additional: 'Доп. блюдо'
    };
    return labels[mealType] || 'Блюдо';
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const handleAutoPlanWeek = async () => {
    if (recipes.length === 0) return;

    // Группируем рецепты по категориям
    const recipesByCategory: Record<string, Recipe[]> = {
      'Завтрак': [],
      'Обед': [],
      'Ужин': [],
      'Десерт': [],
      'Все': []
    };

    recipes.forEach(recipe => {
      if (recipe.category in recipesByCategory) {
        recipesByCategory[recipe.category].push(recipe);
      }
      recipesByCategory['Все'].push(recipe);
    });

    // Функция для получения случайного рецепта из категории
    const getRandomRecipe = (category: string): Recipe | undefined => {
      const categoryRecipes = recipesByCategory[category];
      if (categoryRecipes.length > 0) {
        return categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)];
      }
      // Если нет рецептов в категории, используем любые доступные
      if (recipes.length > 0) {
        return recipes[Math.floor(Math.random() * recipes.length)];
      }
      return undefined;
    };

    // Создаем план для недели
    const newPlan: Record<string, MealPlan> = { ...menuPlan };
    const usedRecipes = new Set<string>(); // Для отслеживания использованных рецептов

    currentWeekDays.forEach((date) => {
      const dayKey = date.toISOString().split('T')[0];
      
      // Получаем рецепты для каждого приема пищи
      let breakfast = getRandomRecipe('Завтрак');
      let lunch = getRandomRecipe('Обед');
      let dinner = getRandomRecipe('Ужин');
      let extra = getRandomRecipe('Десерт');

      // Если рецепт уже использован, берем другой
      const getUniqueRecipe = (recipe: Recipe | undefined, category: string): Recipe | undefined => {
        if (!recipe) return undefined;
        if (usedRecipes.has(recipe.id)) {
          // Пробуем найти другой рецепт из той же категории
          const categoryRecipes = recipesByCategory[category].filter(r => !usedRecipes.has(r.id));
          if (categoryRecipes.length > 0) {
            return categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)];
          }
          // Если все рецепты категории использованы, сбрасываем счетчик и используем любой
          if (recipesByCategory[category].length > 0) {
            return recipesByCategory[category][Math.floor(Math.random() * recipesByCategory[category].length)];
          }
          return recipe;
        }
        return recipe;
      };

      breakfast = getUniqueRecipe(breakfast, 'Завтрак');
      lunch = getUniqueRecipe(lunch, 'Обед');
      dinner = getUniqueRecipe(dinner, 'Ужин');
      extra = getUniqueRecipe(extra, 'Десерт');

      // Отмечаем использованные рецепты
      if (breakfast) usedRecipes.add(breakfast.id);
      if (lunch) usedRecipes.add(lunch.id);
      if (dinner) usedRecipes.add(dinner.id);
      if (extra) usedRecipes.add(extra.id);

      // Если использовано много рецептов, сбрасываем счетчик для разнообразия
      if (usedRecipes.size > recipes.length * 0.7) {
        usedRecipes.clear();
      }

      newPlan[dayKey] = {
        breakfast,
        lunch,
        dinner,
        extra
      };
    });

    // Загружаем полные данные рецептов перед сохранением
    const loadFullRecipesForPlan = async (plan: Record<string, MealPlan>) => {
      const updatedPlan: Record<string, MealPlan> = {};
      
      for (const [dayKey, dayPlan] of Object.entries(plan)) {
        const updatedDayPlan: MealPlan = {};
        
        const loadRecipe = async (recipe: Recipe | undefined): Promise<Recipe | undefined> => {
          if (!recipe) return undefined;
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            return recipe; // Уже есть полные данные
          }
          try {
            const apiRecipe = await api.getRecipe(Number(recipe.id));
            return {
              ...recipe,
              caloriesPerServing: apiRecipe.calories_per_serving,
              proteinsPerServing: apiRecipe.proteins_per_serving,
              fatsPerServing: apiRecipe.fats_per_serving,
              carbohydratesPerServing: apiRecipe.carbohydrates_per_serving,
              ingredients: apiRecipe.ingredients.map(ing => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit
              })),
              steps: apiRecipe.steps.map(step => ({
                number: step.number,
                instruction: step.instruction,
                image: step.image,
                ingredients: []
              }))
            };
          } catch (err) {
            console.error('Error loading full recipe:', err);
            return recipe;
          }
        };

        updatedDayPlan.breakfast = await loadRecipe(dayPlan.breakfast);
        updatedDayPlan.lunch = await loadRecipe(dayPlan.lunch);
        updatedDayPlan.dinner = await loadRecipe(dayPlan.dinner);
        updatedDayPlan.extra = await loadRecipe(dayPlan.extra);
        if (dayPlan.additional) {
          updatedDayPlan.additional = await Promise.all(
            dayPlan.additional.map(recipe => loadRecipe(recipe))
          );
          updatedDayPlan.additional = updatedDayPlan.additional.filter((r): r is Recipe => r !== undefined);
        }

        updatedPlan[dayKey] = updatedDayPlan;
      }

      return updatedPlan;
    };

    try {
      const planWithFullRecipes = await loadFullRecipesForPlan(newPlan);
      setMenuPlan(planWithFullRecipes);
      
      if (onMenuPlanChange) {
        onMenuPlanChange(planWithFullRecipes);
      }
    } catch (err) {
      console.error('Error auto-planning week:', err);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <Text style={styles.headerSubtitle}>{getWeekDateRange()}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              style={[styles.navButton, currentWeek === 0 && styles.navButtonDisabled]}
            >
              <Ionicons name="chevron-back" size={22} color={currentWeek === 0 ? colors.gray300 : colors.black} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.min(weeks.length - 1, currentWeek + 1))}
              disabled={currentWeek === weeks.length - 1}
              style={[styles.navButton, currentWeek === weeks.length - 1 && styles.navButtonDisabled]}
            >
              <Ionicons name="chevron-forward" size={22} color={currentWeek === weeks.length - 1 ? colors.gray300 : colors.black} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.weekIndicator}>
          <View style={styles.weekIndicatorContainer}>
            {weeks.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.weekDot,
                  index === currentWeek && styles.weekDotActive
                ]}
              />
            ))}
          </View>
          <Text style={styles.weekIndicatorText}>
            {currentWeek === 0 ? 'Текущая неделя' : 'Следующая неделя'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAutoPlanWeek}
          style={styles.autoPlanButton}
          activeOpacity={0.8}
        >
          <Ionicons name="restaurant" size={18} color={colors.white} />
          <Text style={styles.autoPlanButtonText}>Составить</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysList}>
        {currentWeekDays.map((date) => {
          const dayKey = date.toISOString().split('T')[0];
          const dayPlan = menuPlan[dayKey] || {};
          const dayOfWeekIndex = (date.getDay() + 6) % 7;
          
          return (
            <View 
              key={dayKey}
              style={[
                styles.dayCard,
                isToday(date) && styles.dayCardToday,
                !isCurrentMonth(date) && styles.dayCardOtherMonth
              ]}
            >
              <View style={[
                styles.dayHeader,
                isToday(date) && styles.dayHeaderToday
              ]}>
                <View style={styles.dayHeaderContent}>
                  <View style={styles.dayInfoRow}>
                    <Text style={[
                      styles.dayOfWeek,
                      isToday(date) && styles.dayOfWeekToday
                    ]}>
                      {daysOfWeek[dayOfWeekIndex]}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      isToday(date) && styles.dayNumberToday
                    ]}>
                      {date.getDate()}
                    </Text>
                    {!isCurrentMonth(date) && (
                      <Text style={styles.dayMonth}>
                        {monthNames[date.getMonth()].slice(0, 3).toLowerCase()}
                      </Text>
                    )}
                  </View>
                  {isToday(date) && (
                    <View style={styles.todayIndicator} />
                  )}
                </View>
              </View>

              <View style={styles.mealsList}>
                <MealSlot
                  mealType="breakfast"
                  mealLabel="Завтрак"
                  recipe={dayPlan.breakfast}
                  onAdd={() => handleAddMeal(dayKey, 'breakfast')}
                  onRemove={() => handleRemoveMeal(dayKey, 'breakfast')}
                  vertical
                />
                <MealSlot
                  mealType="lunch"
                  mealLabel="Обед"
                  recipe={dayPlan.lunch}
                  onAdd={() => handleAddMeal(dayKey, 'lunch')}
                  onRemove={() => handleRemoveMeal(dayKey, 'lunch')}
                  vertical
                />
                <MealSlot
                  mealType="dinner"
                  mealLabel="Ужин"
                  recipe={dayPlan.dinner}
                  onAdd={() => handleAddMeal(dayKey, 'dinner')}
                  onRemove={() => handleRemoveMeal(dayKey, 'dinner')}
                  vertical
                />
                <MealSlot
                  mealType="extra"
                  mealLabel="Десерт"
                  recipe={dayPlan.extra}
                  onAdd={() => handleAddMeal(dayKey, 'extra')}
                  onRemove={() => handleRemoveMeal(dayKey, 'extra')}
                  vertical
                />
                
                {dayPlan.additional?.map((recipe, idx) => (
                  <MealSlot
                    key={`additional-${idx}`}
                    mealType="additional"
                    mealLabel={`Доп. блюдо ${idx + 1}`}
                    recipe={recipe}
                    onAdd={() => handleAddMeal(dayKey, 'additional', idx)}
                    onRemove={() => handleRemoveMeal(dayKey, 'additional', idx)}
                    vertical
                  />
                ))}
                
                <TouchableOpacity
                  onPress={() => handleAddAdditionalMeal(dayKey)}
                  style={styles.addAdditionalButton}
                >
                  <Ionicons name="add" size={16} color={colors.textSecondary} />
                  <Text style={styles.addAdditionalText}>Добавить доп. блюдо</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {selectorOpen && selectedSlot && (
        <RecipeSelector
          recipes={recipes}
          onSelect={handleSelectRecipe}
          onClose={() => {
            setSelectorOpen(false);
            setSelectedSlot(null);
          }}
          mealType={getMealLabel(selectedSlot.mealType)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  header: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    padding: 4,
  },
  navButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  weekIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  weekIndicatorContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  weekDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray300,
  },
  weekDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  weekIndicatorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  autoPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  autoPlanButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  daysList: {
    gap: 24,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayCardToday: {
    borderWidth: 2.5,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  dayCardOtherMonth: {
    opacity: 0.5,
  },
  dayHeader: {
    backgroundColor: colors.grayBg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray200,
  },
  dayHeaderToday: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.black,
    borderBottomWidth: 3,
  },
  dayHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
  },
  dayOfWeek: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    minWidth: 32,
  },
  dayOfWeekToday: {
    color: colors.black,
    fontWeight: '800',
    fontSize: 14,
  },
  dayNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.black,
    lineHeight: 32,
  },
  dayNumberToday: {
    color: colors.black,
    fontSize: 30,
  },
  dayMonth: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'lowercase',
    marginLeft: 4,
  },
  todayIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
  },
  mealsList: {
    padding: 16,
    gap: 10,
  },
  addAdditionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 14,
    backgroundColor: colors.grayBg,
  },
  addAdditionalText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

