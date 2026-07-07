import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Report, ReportPriority, ReportStatus } from '../../types/report.types';
import { CATEGORIES } from '../../constants/categories';

interface ReportListItemProps {
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
      return { label: 'In Progress', color: Colors.alertOrange, bg: '#FFF7ED' };
    case 'resolved':
      return { label: 'Resolved', color: Colors.environmentalGreen, bg: '#F0FDF4' };
    default:
      return { label: status, color: '#6B7280', bg: '#F3F4F6' };
  }
};

const getPriorityStyles = (priority?: ReportPriority) => {
  switch (priority) {
    case 'high':
      return { color: Colors.alertOrange, label: 'High' };
    case 'medium':
      return { color: '#F59E0B', label: 'Medium' }; // yellow
    case 'low':
      return { color: Colors.environmentalGreen, label: 'Low' };
    default:
      return { color: '#6B7280', label: 'Unassigned' };
  }
};

export const ReportListItem: React.FC<ReportListItemProps> = ({ report, onPress }) => {
  const categoryItem = CATEGORIES.find((c) => c.id === report.category);
  const statusStyles = getStatusStyles(report.status);
  const priorityStyles = getPriorityStyles(report.priority);

  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

        {}
        <View style={styles.priorityRow}>
          <View style={[styles.priorityDot, { backgroundColor: priorityStyles.color }]} />
          <Text style={styles.priorityText}>{priorityStyles.label} Priority</Text>
        </View>

        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: statusStyles.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyles.color }]}>
              {statusStyles.label}
            </Text>
          </View>
          {report.assignedDepartment ? (
            <Text style={styles.department} numberOfLines={1}>
              {report.assignedDepartment}
            </Text>
          ) : null}
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
    borderWidth: 1,
    borderColor: '#EFF6FF',
    ...Colors.shadow.soft,
    alignItems: 'center',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: Colors.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    flex: 1,
    marginRight: Colors.spacing.xs,
  },
  date: {
    fontSize: 10,
    color: Colors.grayText,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
  },
  department: {
    fontSize: 11,
    color: Colors.grayText,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    marginLeft: Colors.spacing.xs,
  },
});
