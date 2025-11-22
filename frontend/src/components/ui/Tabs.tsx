import React, { useState, ReactNode } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const childrenArray = React.Children.toArray(children) as any[];
  const tabsList = childrenArray.find((child: any) => child?.type?.name === 'TabsList' || child?.type === TabsList);
  const tabsContent = childrenArray.filter((child: any) => child?.type?.name === 'TabsContent' || child?.type === TabsContent);

  return (
    <View>
      {tabsList && React.cloneElement(tabsList, { activeTab, setActiveTab })}
      {tabsContent.map((content: any, index: number) =>
        React.cloneElement(content, { key: index, activeTab, setActiveTab })
      )}
    </View>
  );
}

export function TabsList({ children, className, activeTab, setActiveTab }: any) {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <View style={styles.tabsList}>
      {childrenArray.map((child: any) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </View>
  );
}

export function TabsTrigger({ value, children, className, activeTab, setActiveTab }: any) {
  const isActive = activeTab === value;
  
  // Проверяем, является ли children текстом
  const isText = typeof children === 'string';
  
  // Функция для клонирования элементов с правильным цветом
  const cloneWithColor = (element: any): any => {
    if (!element || typeof element !== 'object') return element;
    
    // Проверяем, является ли элемент Ionicons
    if (element.type?.displayName === 'Ionicons' || 
        (element.type && element.type.name === 'Ionicons') ||
        (element.props && element.props.name)) {
      return React.cloneElement(element, {
        color: element.props?.color || (isActive ? colors.black : colors.textSecondary)
      });
    }
    
    // Если это View, рекурсивно обрабатываем его children
    if (element.type === View || (element.type && element.type.displayName === 'View')) {
      return React.cloneElement(element, {
        children: React.Children.map(element.props.children, cloneWithColor)
      });
    }
    
    return element;
  };

  return (
    <TouchableOpacity
      style={[styles.tabTrigger, isActive && styles.tabTriggerActive]}
      onPress={() => setActiveTab(value)}
    >
      {isText ? (
        <Text 
          style={[styles.tabTriggerText, isActive && styles.tabTriggerTextActive]}
          numberOfLines={1}
        >
          {children}
        </Text>
      ) : (
        <View style={styles.tabTriggerContent}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return cloneWithColor(child);
            }
            return child;
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

export function TabsContent({ value, children, className, activeTab }: any) {
  if (activeTab !== value) {
    return null;
  }

  return <View style={styles.tabContent}>{children}</View>;
}

const styles = StyleSheet.create({
  tabsList: {
    flexDirection: 'row',
    backgroundColor: colors.grayBg,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  tabTriggerActive: {
    backgroundColor: colors.primary,
  },
  tabTriggerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    flexShrink: 0,
    textAlign: 'center',
  },
  tabTriggerTextActive: {
    color: colors.black,
  },
  tabContent: {
    marginTop: 16,
  },
});

