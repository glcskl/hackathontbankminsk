import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Checkbox } from './ui/Checkbox';
import { ReviewSection } from './ReviewSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { colors } from '../constants/colors';
import { Recipe, Ingredient } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  userIngredients?: Map<string, { quantity: number; price: number }>;
  onAddReview?: (recipeId: string, rating: number, comment: string, image?: string) => void;
}

export function RecipeDetail({ recipe, onClose, userIngredients = new Map(), onAddReview }: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  const servingsMultiplier = servings / recipe.servings;

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const adjustAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return (num * servingsMultiplier).toFixed(1).replace(/\.0$/, '');
  };

  const missingIngredients = recipe.ingredients.filter((ing, index) => {
    if (checkedIngredients.has(index)) return false;
    
    const userIng = userIngredients.get(ing.name);
    if (!userIng || userIng.quantity === 0) return true;
    
    const requiredAmount = parseFloat(adjustAmount(ing.amount)) || 0;
    return userIng.quantity < requiredAmount;
  });

  const calculateShoppingCost = () => {
    let total = 0;
    missingIngredients.forEach(ing => {
      const userIng = userIngredients.get(ing.name);
      const requiredAmount = parseFloat(adjustAmount(ing.amount)) || 0;
      const availableAmount = userIng?.quantity || 0;
      const neededAmount = Math.max(0, requiredAmount - availableAmount);
      const price = userIng?.price || 50;
      total += neededAmount * price;
    });
    return total;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddReview = (rating: number, comment: string, image?: string) => {
    if (onAddReview) {
      onAddReview(recipe.id, rating, comment, image);
    }
  };

  const getCurrentStepIngredients = () => {
    const step = recipe.steps[currentStep];
    if (!step?.ingredients) return [];
    
    return step.ingredients.map(ingName => {
      const ing = recipe.ingredients.find(i => i.name === ingName);
      return ing ? {
        ...ing,
        amount: adjustAmount(ing.amount)
      } : null;
    }).filter(Boolean) as (Ingredient & { amount: string })[];
  };

  const totalCalories = recipe.caloriesPerServing ? recipe.caloriesPerServing * servings : null;

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageContainer}>
              <ImageWithFallback 
                src={recipe.image}
                alt={recipe.title}
                style={styles.image}
              />
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <View style={styles.titleCard}>
                  <Text style={styles.title}>{recipe.title}</Text>
                  <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{recipe.cookTime} мин</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="restaurant-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{recipe.category}</Text>
                    </View>
                    {totalCalories && (
                      <View style={styles.metaItem}>
                        <Ionicons name="flame" size={16} color={colors.orange500} />
                        <Text style={styles.metaText}>{totalCalories} ккал</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Количество порций</Text>
                <View style={styles.servingsContainer}>
                  <TouchableOpacity
                    onPress={() => setServings(Math.max(1, servings - 1))}
                    style={styles.servingsButton}
                  >
                    <Ionicons name="remove" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <View style={styles.servingsDisplay}>
                    <Ionicons name="people" size={20} color={colors.black} />
                    <Text style={styles.servingsText}>{servings}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setServings(servings + 1)}
                    style={styles.servingsButton}
                  >
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.tabsContainer}>
                <Tabs defaultValue="ingredients">
                  <TabsList>
                    <TabsTrigger value="ingredients">
                      <Ionicons name="list" size={22} />
                    </TabsTrigger>
                    <TabsTrigger value="shopping">
                      <View style={styles.tabIconContainer}>
                        <Ionicons name="cart" size={22} />
                        {missingIngredients.length > 0 && (
                          <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{missingIngredients.length}</Text>
                          </View>
                        )}
                      </View>
                    </TabsTrigger>
                    <TabsTrigger value="steps">
                      <Ionicons name="restaurant" size={22} />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ingredients">
                    <Text style={styles.tabTitle}>Ингредиенты</Text>
                    <View style={styles.ingredientsList}>
                      {recipe.ingredients.map((ingredient, index) => {
                        const userIng = userIngredients.get(ingredient.name);
                        const requiredAmount = parseFloat(adjustAmount(ingredient.amount)) || 0;
                        const availableAmount = userIng?.quantity || 0;
                        const hasEnough = availableAmount >= requiredAmount;
                        
                        return (
                          <View 
                            key={index}
                            style={[
                              styles.ingredientItem,
                              hasEnough ? styles.ingredientItemGreen : availableAmount > 0 ? styles.ingredientItemOrange : styles.ingredientItemGray
                            ]}
                          >
                            <Checkbox
                              checked={checkedIngredients.has(index)}
                              onCheckedChange={() => toggleIngredient(index)}
                            />
                            <Text
                              style={[
                                styles.ingredientText,
                                checkedIngredients.has(index) && styles.ingredientTextChecked
                              ]}
                            >
                              {ingredient.name} — {adjustAmount(ingredient.amount)} {ingredient.unit}
                              {hasEnough && (
                                <Text style={styles.ingredientStatus}> ✓ Достаточно ({availableAmount})</Text>
                              )}
                              {!hasEnough && availableAmount > 0 && (
                                <Text style={styles.ingredientStatusWarning}> ⚠ Недостаточно ({availableAmount}/{requiredAmount})</Text>
                              )}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </TabsContent>

                  <TabsContent value="shopping">
                    <View style={styles.shoppingHeader}>
                      <Ionicons name="cart" size={24} color={colors.primary} />
                      <View>
                        <Text style={styles.tabTitle}>Список покупок</Text>
                        <Text style={styles.shoppingSubtitle}>
                          Ингредиенты, которые нужно купить для этого рецепта
                        </Text>
                      </View>
                    </View>

                    {missingIngredients.length === 0 ? (
                      <View style={styles.emptyShopping}>
                        <View style={styles.emptyIcon}>
                          <Ionicons name="cart" size={32} color={colors.green600} />
                        </View>
                        <Text style={styles.emptyTitle}>Всё готово!</Text>
                        <Text style={styles.emptyText}>У вас есть все необходимые ингредиенты</Text>
                      </View>
                    ) : (
                      <View style={styles.shoppingContent}>
                        <View style={styles.totalCost}>
                          <View>
                            <Text style={styles.totalCostLabel}>Примерная стоимость</Text>
                            <Text style={styles.totalCostValue}>{formatPrice(calculateShoppingCost())}</Text>
                          </View>
                          <Ionicons name="cart" size={28} color={colors.black} />
                        </View>

                        <View style={styles.shoppingList}>
                          {missingIngredients.map((ingredient, index) => {
                            const userIng = userIngredients.get(ingredient.name);
                            const requiredAmount = parseFloat(adjustAmount(ingredient.amount)) || 0;
                            const availableAmount = userIng?.quantity || 0;
                            const neededAmount = Math.max(0, requiredAmount - availableAmount);
                            const price = userIng?.price || 50;
                            const total = neededAmount * price;

                            return (
                              <View key={index} style={styles.shoppingItem}>
                                <View style={styles.shoppingItemContent}>
                                  <Text style={styles.shoppingItemName}>{ingredient.name}</Text>
                                  <Text style={styles.shoppingItemPrice}>{formatPrice(total)}</Text>
                                </View>
                                <Text style={styles.shoppingItemDetails}>
                                  Нужно: {neededAmount.toFixed(1).replace(/\.0$/, '')} {ingredient.unit}
                                  {availableAmount > 0 && ` (есть ${availableAmount} ${ingredient.unit})`}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </TabsContent>

                  <TabsContent value="steps">
                    <View style={styles.stepsHeader}>
                      <Text style={styles.tabTitle}>Пошаговое приготовление</Text>
                      <Text style={styles.stepsCounter}>
                        Шаг {currentStep + 1} из {recipe.steps.length}
                      </Text>
                    </View>

                    <View style={styles.stepContent}>
                      <View style={styles.stepImageContainer}>
                        <ImageWithFallback
                          src={recipe.steps[currentStep]?.image}
                          alt={`Шаг ${currentStep + 1}: ${recipe.steps[currentStep]?.instruction || ''}`}
                          style={styles.stepImage}
                          fallbackStyle={styles.stepImagePlaceholder}
                        />
                        {!recipe.steps[currentStep]?.image && (
                          <View style={styles.stepImagePlaceholderOverlay}>
                            <Ionicons name="image-outline" size={48} color={colors.gray300} />
                            <Text style={styles.stepImagePlaceholderText}>
                              Изображение шага {currentStep + 1}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.stepInstruction}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>
                          {recipe.steps[currentStep]?.instruction}
                        </Text>
                      </View>

                      {getCurrentStepIngredients().length > 0 && (
                        <View style={styles.stepIngredients}>
                          <Text style={styles.stepIngredientsTitle}>Ингредиенты для этого шага:</Text>
                          {getCurrentStepIngredients().map((ing, idx) => (
                            <Text key={idx} style={styles.stepIngredientItem}>
                              • {ing.name} — {ing.amount} {ing.unit}
                            </Text>
                          ))}
                        </View>
                      )}

                      <View style={styles.stepNavigation}>
                        <TouchableOpacity
                          onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                          style={[styles.stepNavButton, styles.stepNavButtonBack, currentStep === 0 && styles.stepNavButtonDisabled]}
                        >
                          <Ionicons name="chevron-back" size={20} color={colors.text} />
                          <Text style={styles.stepNavButtonText}>Назад</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setCurrentStep(Math.min(recipe.steps.length - 1, currentStep + 1))}
                          disabled={currentStep === recipe.steps.length - 1}
                          style={[styles.stepNavButton, styles.stepNavButtonNext, currentStep === recipe.steps.length - 1 && styles.stepNavButtonDisabled]}
                        >
                          <Text style={styles.stepNavButtonText}>Далее</Text>
                          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.progressBar}>
                        <View 
                          style={[styles.progressFill, { width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }]}
                        />
                      </View>
                    </View>
                  </TabsContent>
                </Tabs>
              </View>

              {onAddReview && (
                <ReviewSection
                  reviews={recipe.reviews || []}
                  averageRating={recipe.rating || 0}
                  onAddReview={handleAddReview}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
    marginTop: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  titleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    padding: 16,
    gap: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  servingsButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 10,
  },
  servingsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  servingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.orange50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  caloriesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  caloriesValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  ingredientItemGreen: {
    backgroundColor: colors.green50,
  },
  ingredientItemOrange: {
    backgroundColor: colors.orange50,
  },
  ingredientItemGray: {
    backgroundColor: colors.grayBg,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  ingredientStatus: {
    fontSize: 12,
    color: colors.green600,
  },
  ingredientStatusWarning: {
    fontSize: 12,
    color: colors.orange600,
  },
  shoppingHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shoppingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyShopping: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  shoppingContent: {
    gap: 16,
  },
  totalCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
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
  shoppingList: {
    gap: 8,
  },
  shoppingItem: {
    backgroundColor: colors.primary + '40',
    borderRadius: 12,
    padding: 12,
  },
  shoppingItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shoppingItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  shoppingItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  shoppingItemDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepsCounter: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  stepContent: {
    gap: 16,
  },
  stepImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stepImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.grayBg,
  },
  stepImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.grayBg,
  },
  stepImagePlaceholderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  stepImagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepInstruction: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    backgroundColor: colors.black,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingTop: 12,
  },
  stepIngredients: {
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    padding: 16,
  },
  stepIngredientsTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stepIngredientItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  stepNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stepNavButtonBack: {
    backgroundColor: colors.grayBg,
  },
  stepNavButtonNext: {
    backgroundColor: colors.black,
  },
  stepNavButtonDisabled: {
    opacity: 0.3,
  },
  stepNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: colors.orange500,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
});

