import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Report, ReportPriority, ReportStatus } from '../../types/report.types';
import { CATEGORIES } from '../../constants/categories';
import { useTranslation } from '../../hooks/useTranslation';

interface ReportListItemProps {
  report: Report;
  onPress: () => void;
}

const getStatusLabel = (status: ReportStatus, t: any) => {
  switch (status) {
    case 'submitted':
      return t('statusSubmitted' as any) || 'Submitted';
    case 'under_review':
      return t('statusUnderReview' as any) || 'Under Review';
    case 'assigned':
      return t('statusAssigned' as any) || 'Assigned';
    case 'action_started':
      return t('statusActionStarted' as any) || 'In Progress';
    case 'resolved':
      return t('statusResolved' as any) || 'Resolved';
    default:
      return status;
  }
};

const getStatusColors = (status: ReportStatus) => {
  switch (status) {
    case 'submitted':
      return { color: '#6B7280', bg: '#F3F4F6' };
    case 'under_review':
    case 'assigned':
      return { color: Colors.primaryBlue, bg: '#EFF6FF' };
    case 'action_started':
      return { color: Colors.alertOrange, bg: '#FFF7ED' };
    case 'resolved':
      return { color: Colors.environmentalGreen, bg: '#F0FDF4' };
    default:
      return { color: '#6B7280', bg: '#F3F4F6' };
  }
};

const getPriorityLabel = (priority: ReportPriority | undefined, isHindi: boolean) => {
  switch (priority) {
    case 'high':
      return isHindi ? 'उच्च' : 'High';
    case 'medium':
      return isHindi ? 'मध्यम' : 'Medium';
    case 'low':
      return isHindi ? 'निम्न' : 'Low';
    default:
      return isHindi ? 'अनिर्धारित' : 'Unassigned';
  }
};

const getPriorityColor = (priority?: ReportPriority) => {
  switch (priority) {
    case 'high':
      return Colors.alertOrange;
    case 'medium':
      return '#F59E0B'; // yellow
    case 'low':
      return Colors.environmentalGreen;
    default:
      return '#6B7280';
  }
};

export const ReportListItem: React.FC<ReportListItemProps> = ({ report, onPress }) => {
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const categoryItem = CATEGORIES.find((c) => c.id === report.category);
  const categoryLabel = categoryItem
    ? t(categoryItem.id as any)
    : report.category;

  const statusLabel = getStatusLabel(report.status, t);
  const statusColors = getStatusColors(report.status);
  const priorityLabel = getPriorityLabel(report.priority, isHindi);
  const priorityColor = getPriorityColor(report.priority);

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
            {categoryLabel}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        <View style={styles.priorityRow}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={styles.priorityText}>
            {priorityLabel} {isHindi ? 'प्राथमिकता' : 'Priority'}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.badgeText, { color: statusColors.color }]}>
              {statusLabel}
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
