import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { colors } from '../constants/colors';
import { Recipe } from '../types';

interface RecipeCardProps extends Recipe {
  onClick: () => void;
}

export function RecipeCard({ title, category, cookTime, servings, image, rating, onClick }: RecipeCardProps) {
  const categoryColors: Record<string, { bg: string; text: string }> = {
    'Завтрак': { bg: colors.primary, text: colors.black },
    'Обед': { bg: colors.black, text: colors.primary },
    'Ужин': { bg: colors.primary, text: colors.black },
    'Десерт': { bg: colors.black, text: colors.primary },
  };

  const categoryStyle = categoryColors[category] || { bg: colors.primary, text: colors.black };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onClick}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <ImageWithFallback 
          src={image}
          alt={title}
          style={styles.image}
        />
        <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
          <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
            {category}
          </Text>
        </View>
        {rating !== undefined && rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{cookTime} мин</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{servings} порций</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
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
});

