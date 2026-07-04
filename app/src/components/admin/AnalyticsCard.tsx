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
  // dynamically resolve lucide icon
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.BarChart2;

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
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
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    marginHorizontal: Colors.spacing.xs,
    justifyContent: 'space-between',
    minHeight: 90,
    ...Colors.shadow.soft,
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
    ...Colors.shadow.soft,
  },
  label: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
