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

  return (
    <TouchableOpacity
      style={[styles.tabTrigger, isActive && styles.tabTriggerActive]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.tabTriggerText, isActive && styles.tabTriggerTextActive]}>
        {children}
      </Text>
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTriggerActive: {
    backgroundColor: colors.primary,
  },
  tabTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTriggerTextActive: {
    color: colors.black,
  },
  tabContent: {
    marginTop: 16,
  },
});

