import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeCard } from './RecipeCard';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { colors } from '../constants/colors';
import { Recipe } from '../types';

interface RecipeSelectorProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
  mealType: string;
}

export function RecipeSelector({ recipes, onSelect, onClose, mealType }: RecipeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const categories = ['Все', 'Завтрак', 'Обед', 'Ужин', 'Десерт'];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Выберите рецепт</Text>
              <Text style={styles.headerSubtitle}>для {mealType}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </View>

          <View style={styles.filterContainer}>
            <CategoryFilter
              categories={categories}
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </View>

          <ScrollView style={styles.recipesContainer} contentContainerStyle={styles.recipesContent}>
            {filteredRecipes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Рецепты не найдены</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {filteredRecipes.map((recipe) => (
                  <View key={recipe.id} style={styles.gridItem}>
                    <RecipeCard {...recipe} onClick={() => onSelect(recipe)} />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    flex: 1,
  },
  header: {
    backgroundColor: colors.black,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  recipesContainer: {
    flex: 1,
  },
  recipesContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

