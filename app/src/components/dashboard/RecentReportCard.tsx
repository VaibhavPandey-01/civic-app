import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Report, ReportStatus } from '../../types/report.types';
import { CATEGORIES } from '../../constants/categories';

interface RecentReportCardProps {
  report: Report;
  onPress: () => void;
}

const getStatusStyles = (status: ReportStatus) => {
  switch (status) {
    case 'submitted':
      return { label: 'Submitted', color: '#6B7280', bg: '#F3F4F6' };
    case 'under_review':
      return { label: 'Under Review', color: Colors.primaryBlue, bg: '#EFF6FF' };
    case 'assigned':
      return { label: 'Assigned', color: Colors.primaryBlue, bg: '#EFF6FF' };
    case 'action_started':
      return { label: 'Action Started', color: Colors.alertOrange, bg: '#FFF7ED' };
    case 'resolved':
      return { label: 'Resolved', color: Colors.environmentalGreen, bg: '#F0FDF4' };
    default:
      return { label: status, color: '#6B7280', bg: '#F3F4F6' };
  }
};

export const RecentReportCard: React.FC<RecentReportCardProps> = ({ report, onPress }) => {
  const categoryItem = CATEGORIES.find((c) => c.id === report.category);
  const statusStyles = getStatusStyles(report.status);

  // format date helper
  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: report.imageURL }} style={styles.thumbnail} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category} numberOfLines={1}>
            {categoryItem ? categoryItem.label : report.category}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {report.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {report.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: statusStyles.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyles.color }]}>
              {statusStyles.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.sm,
    marginBottom: Colors.spacing.sm,
    ...Colors.shadow.soft,
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    flex: 1,
    marginRight: Colors.spacing.xs,
  },
  date: {
    fontSize: 11,
    color: Colors.grayText,
  },
  description: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
});
