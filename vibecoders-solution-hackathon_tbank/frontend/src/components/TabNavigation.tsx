import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface TabNavigationProps {
  activeTab: 'recipes' | 'menu' | 'ingredients' | 'shopping';
  onTabChange: (tab: 'recipes' | 'menu' | 'ingredients' | 'shopping') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'recipes' as const, label: 'Рецепты', icon: 'book-outline' },
    { id: 'menu' as const, label: 'Мое меню', icon: 'calendar-outline' },
    { id: 'ingredients' as const, label: 'Ингредиенты', icon: 'basket-outline' },
    { id: 'shopping' as const, label: 'Список покупок', icon: 'cart-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={[
            styles.tab,
            activeTab === tab.id ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.id ? colors.black : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.black,
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
});

