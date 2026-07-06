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
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.count}>{count}</Text>
        <View style={[styles.iconCircle, { backgroundColor: bgColor === '#FFFBEB' ? '#FEF3C7' : '#D1D9E6' }]}>
          <IconComponent size={18} color={iconColor} />
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
    backgroundColor: '#E0E5EC',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  label: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
