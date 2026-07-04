import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AIDetectionBadgeProps {
  label: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

export const AIDetectionBadge: React.FC<AIDetectionBadgeProps> = ({
  label,
  confidence,
  priority,
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return Colors.alertOrange;
      case 'medium':
        return Colors.primaryBlue;
      default:
        return Colors.grayText;
    }
  };

  const priorityColor = getPriorityColor();

  return (
    <View style={styles.badgeContainer}>
      <View style={styles.header}>
        <Sparkles size={14} color={Colors.primaryBlue} />
        <Text style={styles.headerTitle}>AI Smart Tag</Text>
      </View>
      <Text style={styles.bodyText}>
        Detected: <Text style={styles.boldText}>{label}</Text> {'\n'}
        Confidence: <Text style={styles.boldText}>{confidence}%</Text> • Priority:{' '}
        <Text style={[styles.boldText, { color: priorityColor }]}>
          {priority.toUpperCase()}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#EFF6FF', // light blue background
    borderRadius: Colors.radius.sm,
    padding: Colors.spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: Colors.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 12,
    color: Colors.darkText,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: Typography.fontWeight.bold,
  },
});
