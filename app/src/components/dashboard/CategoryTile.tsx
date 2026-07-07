import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { CategoryItem } from '../../constants/categories';
import { useTranslation } from '../../hooks/useTranslation';

const getCategoryLabelHi = (categoryId: string) => {
  switch (categoryId) {
    case 'garbage_dump':
      return 'कचरा डंप';
    case 'plastic_pollution':
      return 'प्लास्टिक प्रदूषण';
    case 'waste_accumulation':
      return 'कचरा संचय';
    case 'water_pollution':
      return 'जल प्रदूषण';
    case 'suspicious_object':
      return 'संदिग्ध वस्तु';
    case 'emergency_situation':
      return 'आपातकालीन स्थिति';
    default:
      return categoryId;
  }
};

interface CategoryTileProps {
  category: CategoryItem;
  onPress: () => void;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({ category, onPress }) => {
  const IconComponent = (LucideIcons as any)[category.iconName] || LucideIcons.HelpCircle;
  const brColor = `${category.color}35`;
  const { language } = useTranslation();
  const isHindi = language === 'hi';

  return (
    <TouchableOpacity
      style={[styles.tile, { borderBottomColor: brColor, borderRightColor: brColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
        <IconComponent size={24} color={category.color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {isHindi ? getCategoryLabelHi(category.id) : category.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Colors.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    margin: Colors.spacing.xs,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 13,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    textAlign: 'center',
    marginTop: 4,
  },
});
