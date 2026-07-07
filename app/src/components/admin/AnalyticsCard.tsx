import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AnalyticsCardProps {
  count: number | string;
  label: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  count,
  label,
  iconName,
  iconColor,
  bgColor,
}) => {
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.BarChart2;

  const getBottomRightBorderColor = (bg: string) => {
    switch (bg) {
      case '#EFF6FF': return '#DBEAFE';
      case '#FFF7ED': return '#FED7AA';
      case '#F0FDF4': return '#D1FAE5';
      case '#FFFBEB': return '#FEF08A';
      default: return '#E5E7EB';
    }
  };

  const brColor = getBottomRightBorderColor(bgColor);

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderBottomColor: brColor, borderRightColor: brColor }]}>
      <View style={styles.header}>
        <Text style={styles.count}>{count}</Text>
        <View style={styles.iconCircle}>
          <IconComponent size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: Colors.spacing.md,
    marginHorizontal: Colors.spacing.xs,
    justifyContent: 'space-between',
    minHeight: 90,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  count: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  label: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
