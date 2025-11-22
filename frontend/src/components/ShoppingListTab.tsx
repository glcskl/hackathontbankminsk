import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { colors } from '../constants/colors';
import { Recipe, MealPlan } from '../types';

interface ShoppingListTabProps {
  menuPlan: Record<string, MealPlan>;
  recipes: Recipe[];
  userIngredients: Map<string, { quantity: number; price: number }>;
}

interface ShoppingItem {
  name: string;
  needed: number;
  unit: string;
  price: number;
  total: number;
  recipes: string[];
}

export function ShoppingListTab({ menuPlan, recipes, userIngredients }: ShoppingListTabProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTomorrowDate = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getWeekRange = () => {
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    return { start, end };
  };

  const getMonthRange = () => {
    const start = new Date(today);
    const end = new Date(today);
    end.setMonth(end.getMonth() + 1);
    return { start, end };
  };

  const calculateShoppingList = (startDate: Date, endDate: Date): ShoppingItem[] => {
    const ingredientMap = new Map<string, { needed: number; unit: string; price: number; recipes: Set<string> }>();

    Object.entries(menuPlan).forEach(([dateStr, meals]) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);

      if (date >= startDate && date <= endDate) {
        const allMeals = [
          meals.breakfast,
          meals.lunch,
          meals.dinner,
          meals.extra,
          ...(meals.additional || [])
        ].filter(Boolean) as Recipe[];

        allMeals.forEach(recipe => {
          recipe.ingredients.forEach(ing => {
            const amount = parseFloat(ing.amount) || 0;
            const userIng = userIngredients.get(ing.name);
            const userQuantity = userIng?.quantity || 0;
            const price = userIng?.price || 50;

            if (!ingredientMap.has(ing.name)) {
              ingredientMap.set(ing.name, {
                needed: 0,
                unit: ing.unit,
                price,
                recipes: new Set()
              });
            }

            const item = ingredientMap.get(ing.name)!;
            item.needed += amount;
            item.recipes.add(recipe.title);
          });
        });
      }
    });

    const shoppingList: ShoppingItem[] = [];
    ingredientMap.forEach((data, name) => {
      const userIng = userIngredients.get(name);
      const userQuantity = userIng?.quantity || 0;
      const neededQuantity = Math.max(0, data.needed - userQuantity);

      if (neededQuantity > 0) {
        shoppingList.push({
          name,
          needed: neededQuantity,
          unit: data.unit,
          price: data.price,
          total: neededQuantity * data.price,
          recipes: Array.from(data.recipes)
        });
      }
    });

    return shoppingList.sort((a, b) => a.name.localeCompare(b.name));
  };

  const tomorrowList = useMemo(
    () => {
      const tomorrow = getTomorrowDate();
      return calculateShoppingList(tomorrow, tomorrow);
    },
    [menuPlan, userIngredients]
  );

  const weekList = useMemo(
    () => {
      const { start, end } = getWeekRange();
      return calculateShoppingList(start, end);
    },
    [menuPlan, userIngredients]
  );

  const monthList = useMemo(
    () => {
      const { start, end } = getMonthRange();
      return calculateShoppingList(start, end);
    },
    [menuPlan, userIngredients]
  );

  const calculateTotal = (list: ShoppingItem[]) => {
    return list.reduce((sum, item) => sum + item.total, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderShoppingList = (list: ShoppingItem[], title: string) => {
    const total = calculateTotal(list);

    if (list.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={48} color={colors.gray300} />
          <Text style={styles.emptyTitle}>Список покупок пуст</Text>
          <Text style={styles.emptyText}>
            Добавьте рецепты в расписание или все ингредиенты уже есть
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <View style={styles.totalCost}>
          <View>
            <Text style={styles.totalCostLabel}>Итоговая стоимость</Text>
            <Text style={styles.totalCostValue}>{formatPrice(total)}</Text>
          </View>
          <Ionicons name="cart" size={32} color={colors.black} />
        </View>
        <Text style={styles.totalItems}>
          {list.length} {list.length === 1 ? 'позиция' : list.length < 5 ? 'позиции' : 'позиций'}
        </Text>

        <View style={styles.itemsList}>
          {list.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.needed.toFixed(1).replace(/\.0$/, '')} {item.unit} × {formatPrice(item.price)}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.total)}</Text>
              </View>
              
              {item.recipes.length > 0 && (
                <View style={styles.itemRecipes}>
                  <Text style={styles.itemRecipesLabel}>Используется в:</Text>
                  <View style={styles.itemRecipesList}>
                    {item.recipes.map((recipe, idx) => (
                      <View key={idx} style={styles.recipeTag}>
                        <Text style={styles.recipeTagText}>{recipe}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getTomorrowDateFormatted = () => {
    const tomorrow = getTomorrowDate();
    return tomorrow.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="cart" size={24} color={colors.black} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Список покупок</Text>
          <Text style={styles.headerSubtitle}>
            Недостающие ингредиенты из запланированного меню
          </Text>
        </View>
      </View>

      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="tomorrow">Завтра</TabsTrigger>
          <TabsTrigger value="week">Неделя</TabsTrigger>
          <TabsTrigger value="month">Месяц</TabsTrigger>
        </TabsList>

        <TabsContent value="tomorrow">
          <Text style={styles.dateLabel}>{getTomorrowDateFormatted()}</Text>
          {renderShoppingList(tomorrowList, 'Завтра')}
        </TabsContent>

        <TabsContent value="week">
          <Text style={styles.dateLabel}>Следующие 7 дней</Text>
          {renderShoppingList(weekList, 'Неделя')}
        </TabsContent>

        <TabsContent value="month">
          <Text style={styles.dateLabel}>Следующие 30 дней</Text>
          {renderShoppingList(monthList, 'Месяц')}
        </TabsContent>
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  listContainer: {
    gap: 16,
  },
  totalCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  totalCostLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  totalCostValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  totalItems: {
    fontSize: 14,
    color: colors.text,
    marginTop: -8,
  },
  itemsList: {
    gap: 8,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  itemRecipes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  itemRecipesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemRecipesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  recipeTag: {
    backgroundColor: colors.grayBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recipeTagText: {
    fontSize: 12,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
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
  },
});

