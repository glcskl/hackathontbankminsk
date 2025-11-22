import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealSlot } from './MealSlot';
import { RecipeSelector } from './RecipeSelector';
import { colors } from '../constants/colors';
import { Recipe, MealPlan } from '../types';

interface MonthlyMenuProps {
  recipes: Recipe[];
  onMenuPlanChange?: (menuPlan: Record<string, MealPlan>) => void;
}

export function MonthlyMenu({ recipes, onMenuPlanChange }: MonthlyMenuProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [menuPlan, setMenuPlan] = useState<Record<string, MealPlan>>({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; mealType: keyof MealPlan | 'additional'; additionalIndex?: number } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getWeeksInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const weeks: Date[][] = [];
    
    let currentDate = new Date(firstDay);
    currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
    
    while (currentDate <= lastDay || weeks.length === 0) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      if (currentDate.getMonth() > currentMonth) break;
    }
    
    return weeks;
  };

  const weeks = getWeeksInMonth();
  
  const currentWeekDays = (weeks[currentWeek] || []).filter(date => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly >= today;
  });

  const getWeekDateRange = () => {
    if (currentWeekDays.length === 0) return '';
    const firstDay = currentWeekDays[0];
    const lastDay = currentWeekDays[currentWeekDays.length - 1];
    
    return `${firstDay.getDate()} ${monthNames[firstDay.getMonth()].slice(0, 3).toLowerCase()} — ${lastDay.getDate()} ${monthNames[lastDay.getMonth()].slice(0, 3).toLowerCase()}`;
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

  const handleSelectRecipe = (recipe: Recipe) => {
    if (selectedSlot) {
      setMenuPlan(prev => {
        const newPlan = { ...prev };
        const dayPlan = { ...newPlan[selectedSlot.day] };
        
        if (selectedSlot.mealType === 'additional') {
          const additional = [...(dayPlan.additional || [])];
          if (selectedSlot.additionalIndex !== undefined) {
            additional[selectedSlot.additionalIndex] = recipe;
          } else {
            additional.push(recipe);
          }
          dayPlan.additional = additional;
        } else {
          dayPlan[selectedSlot.mealType] = recipe;
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

  const getMealLabel = (mealType: keyof MealPlan) => {
    const labels = {
      breakfast: 'Завтрак',
      lunch: 'Обед',
      dinner: 'Ужин',
      extra: 'Десерт'
    };
    return labels[mealType];
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              style={[styles.navButton, currentWeek === 0 && styles.navButtonDisabled]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.min(weeks.length - 1, currentWeek + 1))}
              disabled={currentWeek === weeks.length - 1}
              style={[styles.navButton, currentWeek === weeks.length - 1 && styles.navButtonDisabled]}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>
            Неделя {currentWeek + 1} из {weeks.length}
          </Text>
          <Text style={styles.headerInfoText}>•</Text>
          <Text style={styles.headerInfoText}>{getWeekDateRange()}</Text>
        </View>
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
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayOfWeek}>{daysOfWeek[dayOfWeekIndex]}</Text>
                  <Text style={styles.dayNumber}>{date.getDate()}</Text>
                  <Text style={styles.dayMonth}>
                    {monthNames[date.getMonth()].slice(0, 3).toLowerCase()}
                  </Text>
                </View>
                {isToday(date) && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>Сегодня</Text>
                  </View>
                )}
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
          mealType={getMealLabel(selectedSlot.mealType === 'additional' ? 'extra' : selectedSlot.mealType as keyof MealPlan)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  headerInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  daysList: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayCardOtherMonth: {
    opacity: 0.5,
  },
  dayHeader: {
    backgroundColor: colors.black,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayOfWeek: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  dayMonth: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  mealsList: {
    padding: 16,
    gap: 8,
  },
  addAdditionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textLight,
    borderRadius: 12,
  },
  addAdditionalText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

