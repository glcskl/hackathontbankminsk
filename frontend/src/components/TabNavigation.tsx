import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface TabNavigationProps {
  activeTab: 'recipes' | 'menu' | 'ingredients' | 'shopping';
  onTabChange: (tab: 'recipes' | 'menu' | 'ingredients' | 'shopping') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'recipes' as const, icon: 'book-outline' },
    { id: 'menu' as const, icon: 'calendar-outline' },
    { id: 'ingredients' as const, icon: 'basket-outline' },
    { id: 'shopping' as const, icon: 'cart-outline' },
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
            size={24}
            color={activeTab === tab.id ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: 'transparent',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
});

