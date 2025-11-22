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
    const ingredientsSet = new Set<string>();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        ingredientsSet.add(ing.name);
      });
    });
    return Array.from(ingredientsSet).sort();
  }, [recipes]);

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return allIngredients;
    return allIngredients.filter(ing => 
      ing.toLowerCase().includes(searchQuery.toLowerCase())
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
      onUpdateIngredient(ingredient, 100, 50);
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

        <ScrollView style={styles.ingredientsList} nestedScrollEnabled>
          {filteredIngredients.map((ingredient) => {
            const data = userIngredients.get(ingredient);
            const isSelected = data && data.quantity > 0;
            
            return (
              <View
                key={ingredient}
                style={[styles.ingredientCard, isSelected && styles.ingredientCardSelected]}
              >
                <TouchableOpacity
                  onPress={() => handleToggleIngredient(ingredient)}
                  style={styles.ingredientButton}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? colors.black : colors.textSecondary}
                  />
                  <Text style={[styles.ingredientName, isSelected && styles.ingredientNameSelected]}>
                    {ingredient}
                  </Text>
                  {isSelected && (
                    <Text style={styles.ingredientQuantity}>
                      {data.quantity}г
                    </Text>
                  )}
                </TouchableOpacity>
                
                {isSelected && (
                  <View style={styles.ingredientControls}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => handleUpdateQuantity(ingredient, -10)}
                        style={styles.controlButton}
                      >
                        <Ionicons name="remove" size={16} color={colors.black} />
                      </TouchableOpacity>
                      <Input
                        value={data.quantity.toString()}
                        onChangeText={(text) => onUpdateIngredient(ingredient, parseFloat(text) || 0, data.price)}
                        keyboardType="numeric"
                        style={styles.quantityInput}
                      />
                      <Text style={styles.unitText}>г/мл/шт</Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateQuantity(ingredient, 10)}
                        style={styles.controlButton}
                      >
                        <Ionicons name="add" size={16} color={colors.black} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.priceControl}>
                      <Text style={styles.priceLabel}>Цена за ед.:</Text>
                      <Input
                        value={data.price.toString()}
                        onChangeText={(text) => handleUpdatePrice(ingredient, parseFloat(text) || 0)}
                        keyboardType="numeric"
                        style={styles.priceInput}
                      />
                      <Text style={styles.unitText}>₽</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {filteredIngredients.length === 0 && (
          <Text style={styles.emptyText}>Ингредиенты не найдены</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рекомендованные рецепты</Text>
        
        {Array.from(userIngredients.values()).filter(v => v.quantity > 0).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Выберите ингредиенты, которые у вас есть
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Мы покажем рецепты, которые вы можете приготовить
            </Text>
          </View>
        ) : sortedRecipes.length === 0 ? (
          <View style={styles.emptyState}>
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
                    <Text style={styles.matchText}>
                      Совпадение: {matchingCount} из {totalCount} ингредиентов
                    </Text>
                    <Text style={styles.matchPercent}>{matchPercent}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${matchPercent}%` }]}
                    />
                  </View>
                  
                  {missingIngredients.length > 0 && (
                    <Text style={styles.missingText}>
                      Нужно купить: {missingIngredients.join(', ')}
                    </Text>
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
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  ingredientNameSelected: {
    color: colors.black,
    fontWeight: '500',
  },
  ingredientQuantity: {
    fontSize: 14,
    color: colors.text,
  },
  ingredientControls: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  quantityControl: {
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
  matchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  matchPercent: {
    fontSize: 14,
    fontWeight: '600',
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
  missingText: {
    fontSize: 14,
    color: colors.text,
  },
});

