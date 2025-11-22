import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { Checkbox } from './ui/Checkbox';
import { colors } from '../constants/colors';
import { Recipe, MealPlan } from '../types';
import * as api from '../services/api';

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
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  const [loadingPurchased, setLoadingPurchased] = useState(true);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Загружаем купленные продукты из БД
  useEffect(() => {
    loadPurchasedItems();
  }, []);

  const loadPurchasedItems = async () => {
    try {
      setLoadingPurchased(true);
      const items = await api.getPurchasedItems('default');
      const purchasedSet = new Set<string>();
      
      items.forEach(item => {
        if (item.purchased === 1) {
          const itemKey = `${item.tab_key}-${item.item_name}`;
          purchasedSet.add(itemKey);
        }
      });
      
      setPurchasedItems(purchasedSet);
    } catch (err) {
      console.error('Error loading purchased items:', err);
    } finally {
      setLoadingPurchased(false);
    }
  };

  const togglePurchased = async (itemKey: string, itemName: string, tabKey: string) => {
    const isCurrentlyPurchased = purchasedItems.has(itemKey);
    const newPurchased = isCurrentlyPurchased ? 0 : 1;
    
    // Обновляем локальное состояние сразу для быстрого отклика
    setPurchasedItems(prev => {
      const newSet = new Set(prev);
      if (newPurchased === 1) {
        newSet.add(itemKey);
      } else {
        newSet.delete(itemKey);
      }
      return newSet;
    });

    // Сохраняем в БД
    try {
      await api.togglePurchasedItem({
        item_name: itemName,
        tab_key: tabKey,
        purchased: newPurchased,
        user_id: 'default'
      });
    } catch (err) {
      console.error('Error saving purchased item:', err);
      // Откатываем изменение при ошибке
      setPurchasedItems(prev => {
        const newSet = new Set(prev);
        if (newPurchased === 1) {
          newSet.delete(itemKey);
        } else {
          newSet.add(itemKey);
        }
        return newSet;
      });
    }
  };

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
          // Проверяем, что у рецепта есть ингредиенты
          if (!recipe.ingredients || recipe.ingredients.length === 0) {
            return; // Пропускаем рецепты без ингредиентов
          }
          
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

  const calculateTotal = (list: ShoppingItem[], tabKey: string) => {
    return list.reduce((sum, item) => {
      const itemKey = `${tabKey}-${item.name}`;
      if (purchasedItems.has(itemKey)) {
        return sum; // Исключаем купленные продукты из стоимости
      }
      return sum + item.total;
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const openEdostavkaSearch = async (itemName: string) => {
    const encodedName = encodeURIComponent(itemName);
    const url = `https://edostavka.by/search?query=${encodedName}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const renderShoppingList = (list: ShoppingItem[], title: string, tabKey: string) => {
    const total = calculateTotal(list, tabKey);
    const unpurchasedCount = list.filter(item => !purchasedItems.has(`${tabKey}-${item.name}`)).length;

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
          {unpurchasedCount} {unpurchasedCount === 1 ? 'позиция' : unpurchasedCount < 5 ? 'позиции' : 'позиций'} {list.length !== unpurchasedCount && `(${list.length - unpurchasedCount} куплено)`}
        </Text>

        <View style={styles.itemsList}>
          {list.map((item, index) => {
            const itemKey = `${tabKey}-${item.name}`;
            const isPurchased = purchasedItems.has(itemKey);
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.item, isPurchased && styles.itemPurchased]}
                onPress={() => {
                  if (!isPurchased) {
                    openEdostavkaSearch(item.name);
                  } else {
                    togglePurchased(itemKey, item.name, tabKey);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.itemContent}>
                  <View
                    onStartShouldSetResponder={() => true}
                    onResponderRelease={() => togglePurchased(itemKey, item.name, tabKey)}
                  >
                    <Checkbox
                      checked={isPurchased}
                      onCheckedChange={() => togglePurchased(itemKey, item.name, tabKey)}
                    />
                  </View>
                  <View style={styles.itemRightContent}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemInfo}>
                        <View style={styles.itemNameRow}>
                          <Text style={[styles.itemName, isPurchased && styles.itemNamePurchased]}>
                            {item.name}
                          </Text>
                          {!isPurchased && (
                            <Ionicons name="open-outline" size={18} color={colors.primary} style={styles.linkIcon} />
                          )}
                        </View>
                        <Text style={[styles.itemDetails, isPurchased && styles.itemDetailsPurchased]}>
                          {item.needed.toFixed(1).replace(/\.0$/, '')} {item.unit} × {formatPrice(item.price)}
                        </Text>
                      </View>
                      <Text style={[styles.itemPrice, isPurchased && styles.itemPricePurchased]}>
                        {formatPrice(item.total)}
                      </Text>
                    </View>
                    
                    {item.recipes.length > 0 && (
                      <View style={styles.itemRecipes}>
                        <Text style={[styles.itemRecipesLabel, isPurchased && styles.itemRecipesLabelPurchased]}>
                          Используется в:
                        </Text>
                        <View style={styles.itemRecipesList}>
                          {item.recipes.map((recipe, idx) => (
                            <View key={idx} style={styles.recipeTag}>
                              <Text style={[styles.recipeTagText, isPurchased && styles.recipeTagTextPurchased]}>
                                {recipe}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const getTomorrowDateFormatted = () => {
    const tomorrow = getTomorrowDate();
    return tomorrow.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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
          {renderShoppingList(tomorrowList, 'Завтра', 'tomorrow')}
        </TabsContent>

        <TabsContent value="week">
          <Text style={styles.dateLabel}>Следующие 7 дней</Text>
          {renderShoppingList(weekList, 'Неделя', 'week')}
        </TabsContent>

        <TabsContent value="month">
          <Text style={styles.dateLabel}>Следующие 30 дней</Text>
          {renderShoppingList(monthList, 'Месяц', 'month')}
        </TabsContent>
      </Tabs>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
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
  itemPurchased: {
    opacity: 0.6,
    backgroundColor: colors.grayBg,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemRightContent: {
    flex: 1,
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
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  linkIcon: {
    marginLeft: 2,
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemDetailsPurchased: {
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  itemPricePurchased: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
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
  itemRecipesLabelPurchased: {
    textDecorationLine: 'line-through',
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
  recipeTagTextPurchased: {
    textDecorationLine: 'line-through',
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

