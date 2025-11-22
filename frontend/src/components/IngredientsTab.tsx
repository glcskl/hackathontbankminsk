import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeCard } from './RecipeCard';
import { SearchBar } from './SearchBar';
import { Input } from './ui/Input';
import { colors } from '../constants/colors';
import { Recipe } from '../types';

interface IngredientsTabProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  userIngredients: Map<string, { quantity: number; price: number }>;
  onUpdateIngredient: (ingredient: string, quantity: number, price: number) => void;
}

export function IngredientsTab({ 
  recipes, 
  onRecipeClick, 
  userIngredients, 
  onUpdateIngredient
}: IngredientsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);

  const allIngredients = useMemo(() => {
    const ingredientsMap = new Map<string, { name: string; unit: string }>();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        if (!ingredientsMap.has(ing.name)) {
          ingredientsMap.set(ing.name, { name: ing.name, unit: ing.unit });
        }
      });
    });
    return Array.from(ingredientsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return allIngredients;
    return allIngredients.filter(ing => 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allIngredients, searchQuery]);

  const recipesWithMatch = useMemo(() => {
    return recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name);
      const matchingCount = recipeIngredients.filter(ing => {
        const userIng = userIngredients.get(ing);
        if (!userIng) return false;
        
        const required = recipe.ingredients.find(i => i.name === ing);
        const requiredAmount = required ? parseFloat(required.amount) || 0 : 0;
        
        return userIng.quantity >= requiredAmount;
      }).length;
      
      const matchPercent = recipeIngredients.length > 0 
        ? Math.round((matchingCount / recipeIngredients.length) * 100)
        : 0;
      
      return {
        recipe,
        matchPercent,
        matchingCount,
        totalCount: recipeIngredients.length,
        missingIngredients: recipeIngredients.filter(ing => {
          const userIng = userIngredients.get(ing);
          if (!userIng || userIng.quantity === 0) return true;
          
          const required = recipe.ingredients.find(i => i.name === ing);
          const requiredAmount = required ? parseFloat(required.amount) || 0 : 0;
          
          return userIng.quantity < requiredAmount;
        })
      };
    });
  }, [recipes, userIngredients]);

  const sortedRecipes = useMemo(() => {
    return [...recipesWithMatch]
      .filter(item => item.matchPercent > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }, [recipesWithMatch]);

  const handleToggleIngredient = (ingredient: string) => {
    const current = userIngredients.get(ingredient);
    if (current && current.quantity > 0) {
      onUpdateIngredient(ingredient, 0, current.price);
    } else {
      // Находим единицу измерения для этого ингредиента
      const ingData = allIngredients.find(ing => ing.name === ingredient);
      const defaultQuantity = ingData?.unit === 'шт' ? 1 : 100;
      onUpdateIngredient(ingredient, defaultQuantity, 50);
      setEditingIngredient(ingredient);
    }
  };

  const handleUpdateQuantity = (ingredient: string, delta: number) => {
    const current = userIngredients.get(ingredient) || { quantity: 0, price: 50 };
    const newQuantity = Math.max(0, current.quantity + delta);
    onUpdateIngredient(ingredient, newQuantity, current.price);
  };

  const handleUpdatePrice = (ingredient: string, price: number) => {
    const current = userIngredients.get(ingredient) || { quantity: 0, price: 50 };
    onUpdateIngredient(ingredient, current.quantity, Math.max(0, price));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мои ингредиенты</Text>
        
        <View style={styles.searchContainer}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </View>

        <Text style={styles.counter}>
          Выбрано: <Text style={styles.counterBold}>{Array.from(userIngredients.values()).filter(v => v.quantity > 0).length}</Text> из {allIngredients.length}
        </Text>

        {allIngredients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyStateText}>
              Ингредиенты не найдены
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Загрузите рецепты, чтобы увидеть доступные ингредиенты
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.ingredientsList} nestedScrollEnabled>
            {filteredIngredients.map((ingredient) => {
            const data = userIngredients.get(ingredient.name);
            const isSelected = data && data.quantity > 0;
            
            return (
              <View
                key={ingredient.name}
                style={[styles.ingredientCard, isSelected && styles.ingredientCardSelected]}
              >
                <TouchableOpacity
                  onPress={() => handleToggleIngredient(ingredient.name)}
                  style={styles.ingredientButton}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? colors.black : colors.textSecondary}
                  />
                  <View style={styles.ingredientInfo}>
                    <Text style={[styles.ingredientName, isSelected && styles.ingredientNameSelected]}>
                      {ingredient.name}
                    </Text>
                    {!isSelected && (
                      <Text style={styles.ingredientUnitHint}>
                        Ед. измерения: {ingredient.unit}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Text style={styles.ingredientQuantity}>
                      {data.quantity} {ingredient.unit}
                    </Text>
                  )}
                </TouchableOpacity>
                
                {isSelected && (
                  <View style={styles.ingredientControls}>
                    <View style={styles.quantityControl}>
                      <Text style={styles.controlLabel}>Количество ({ingredient.unit}):</Text>
                      <View style={styles.quantityControlRow}>
                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(ingredient.name, -10)}
                          style={styles.controlButton}
                        >
                          <Ionicons name="remove" size={16} color={colors.black} />
                        </TouchableOpacity>
                        <Input
                          value={data.quantity.toString()}
                          onChangeText={(text) => onUpdateIngredient(ingredient.name, parseFloat(text) || 0, data.price)}
                          keyboardType="numeric"
                          style={styles.quantityInput}
                        />
                        <TouchableOpacity
                          onPress={() => handleUpdateQuantity(ingredient.name, 10)}
                          style={styles.controlButton}
                        >
                          <Ionicons name="add" size={16} color={colors.black} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.priceControl}>
                      <Text style={styles.priceLabel}>Цена за {ingredient.unit}:</Text>
                      <View style={styles.priceControlRow}>
                        <Input
                          value={data.price.toString()}
                          onChangeText={(text) => handleUpdatePrice(ingredient.name, parseFloat(text) || 0)}
                          keyboardType="numeric"
                          style={styles.priceInput}
                        />
                        <Text style={styles.unitText}>₽</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
          </ScrollView>
        )}

        {filteredIngredients.length === 0 && allIngredients.length > 0 && (
          <Text style={styles.emptyText}>Ингредиенты не найдены по запросу "{searchQuery}"</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Рекомендованные рецепты</Text>
          {sortedRecipes.length > 0 && (
            <Text style={styles.recipesCount}>
              Найдено: {sortedRecipes.length}
            </Text>
          )}
        </View>
        
        {Array.from(userIngredients.values()).filter(v => v.quantity > 0).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyStateText}>
              Выберите ингредиенты, которые у вас есть
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Мы покажем рецепты, которые вы можете приготовить
            </Text>
          </View>
        ) : sortedRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyStateText}>
              К сожалению, нет рецептов с вашими ингредиентами
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Попробуйте добавить больше ингредиентов
            </Text>
          </View>
        ) : (
          <View style={styles.recipesList}>
            {sortedRecipes.map(({ recipe, matchPercent, matchingCount, totalCount, missingIngredients }) => (
              <View key={recipe.id} style={styles.recipeItem}>
                <RecipeCard {...recipe} onClick={() => onRecipeClick(recipe)} />
                
                <View style={styles.matchInfo}>
                  <View style={styles.matchHeader}>
                    <View style={styles.matchInfoLeft}>
                      <Ionicons 
                        name={matchPercent === 100 ? 'checkmark-circle' : 'information-circle-outline'} 
                        size={18} 
                        color={matchPercent === 100 ? colors.primary : colors.textSecondary} 
                      />
                      <Text style={styles.matchText}>
                        Совпадение: {matchingCount} из {totalCount} ингредиентов
                      </Text>
                    </View>
                    <View style={[styles.matchPercentBadge, matchPercent === 100 && styles.matchPercentBadgeComplete]}>
                      <Text style={[styles.matchPercent, matchPercent === 100 && styles.matchPercentComplete]}>
                        {matchPercent}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${matchPercent}%` },
                        matchPercent === 100 && styles.progressFillComplete
                      ]}
                    />
                  </View>
                  
                  {missingIngredients.length > 0 && (
                    <View style={styles.missingContainer}>
                      <Ionicons name="cart-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.missingText}>
                        Нужно купить: <Text style={styles.missingTextBold}>{missingIngredients.join(', ')}</Text>
                      </Text>
                    </View>
                  )}
                  {matchPercent === 100 && (
                    <View style={styles.completeContainer}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      <Text style={styles.completeText}>
                        Все ингредиенты есть! Можно готовить
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipesCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 16,
  },
  counter: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  counterBold: {
    color: colors.black,
    fontWeight: '600',
  },
  ingredientsList: {
    maxHeight: 400,
  },
  ingredientCard: {
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.grayBg,
  },
  ingredientCardSelected: {
    backgroundColor: colors.primary,
  },
  ingredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  ingredientNameSelected: {
    color: colors.black,
    fontWeight: '600',
  },
  ingredientUnitHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  ingredientControls: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  quantityControl: {
    gap: 8,
  },
  controlLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
  },
  controlButton: {
    padding: 6,
    backgroundColor: colors.grayBg,
    borderRadius: 8,
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceControl: {
    gap: 8,
  },
  priceControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceInput: {
    flex: 1,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recipesList: {
    gap: 16,
  },
  recipeItem: {
    gap: 12,
  },
  matchInfo: {
    gap: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  matchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  matchPercentBadge: {
    backgroundColor: colors.grayBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchPercentBadgeComplete: {
    backgroundColor: colors.primary,
  },
  matchPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  matchPercentComplete: {
    color: colors.black,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.grayBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: colors.primary,
  },
  missingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  missingText: {
    fontSize: 14,
    color: colors.text,
  },
  missingTextBold: {
    fontWeight: '600',
    color: colors.black,
  },
  completeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  completeText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '600',
  },
});

