import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { CategoryItem } from '../../constants/categories';

interface CategoryTileProps {
  category: CategoryItem;
  onPress: () => void;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({ category, onPress }) => {

  const IconComponent = (LucideIcons as any)[category.iconName] || LucideIcons.HelpCircle;

  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
        <IconComponent size={24} color={category.color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    margin: Colors.spacing.xs,
    ...Colors.shadow.soft,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    textAlign: 'center',
  },
});
