import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onCategoryChange(category)}
          style={[
            styles.button,
            activeCategory === category ? styles.buttonActive : styles.buttonInactive,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              activeCategory === category ? styles.buttonTextActive : styles.buttonTextInactive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonInactive: {
    backgroundColor: colors.white,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: colors.black,
  },
  buttonTextInactive: {
    color: colors.text,
  },
});

