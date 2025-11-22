import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { colors } from '../constants/colors';
import { Recipe } from '../types';

interface MealSlotProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'extra' | 'additional';
  mealLabel: string;
  recipe?: Recipe;
  onAdd: () => void;
  onRemove: () => void;
  vertical?: boolean;
}

export function MealSlot({ mealType, mealLabel, recipe, onAdd, onRemove, vertical = false }: MealSlotProps) {
  const mealColors: Record<string, { bg: string; border: string }> = {
    breakfast: { bg: colors.orange50, border: colors.orange100 },
    lunch: { bg: colors.blue50, border: colors.blue100 },
    dinner: { bg: colors.purple50, border: colors.purple100 },
    extra: { bg: colors.pink50, border: colors.pink100 },
    additional: { bg: colors.green50, border: colors.green100 },
  };

  const mealIcons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    extra: '🍰',
    additional: '✨',
  };

  const colors_meal = mealColors[mealType] || { bg: colors.grayBg, border: colors.gray200 };

  if (vertical) {
    return (
      <View style={[styles.verticalContainer, { backgroundColor: colors_meal.bg, borderColor: colors_meal.border }]}>
        {recipe ? (
          <View style={styles.verticalContent}>
            <ImageWithFallback
              src={recipe.image}
              alt={recipe.title}
              style={styles.verticalImage}
            />
            <View style={styles.verticalText}>
              <Text style={styles.verticalLabel}>
                {mealIcons[mealType]} {mealLabel}
              </Text>
              <Text style={styles.verticalTitle} numberOfLines={1}>{recipe.title}</Text>
            </View>
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={onAdd} style={styles.addButton}>
            <View style={styles.addImagePlaceholder}>
              <Ionicons name="add" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.addText}>
              <Text style={styles.addLabel}>
                {mealIcons[mealType]} {mealLabel}
              </Text>
              <Text style={styles.addPlaceholder}>Не выбрано</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.horizontalContainer, { backgroundColor: colors_meal.bg, borderColor: colors_meal.border }]}>
      <View style={styles.horizontalHeader}>
        <Text style={styles.horizontalLabel}>
          {mealIcons[mealType]} {mealLabel}
        </Text>
        {recipe && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {recipe ? (
        <View style={styles.recipeCard}>
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.title}
            style={styles.horizontalImage}
          />
          <Text style={styles.horizontalTitle} numberOfLines={2}>{recipe.title}</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={onAdd} style={styles.horizontalAddButton}>
          <Ionicons name="add" size={20} color={colors.textSecondary} />
          <Text style={styles.horizontalAddText}>Добавить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  verticalContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  verticalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verticalImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  verticalText: {
    flex: 1,
    minWidth: 0,
  },
  verticalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  removeButton: {
    padding: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
  },
  addImagePlaceholder: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    flex: 1,
  },
  addLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  horizontalContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 90,
  },
  horizontalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  horizontalLabel: {
    fontSize: 12,
    color: colors.text,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  horizontalTitle: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  horizontalAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 12,
  },
  horizontalAddText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

