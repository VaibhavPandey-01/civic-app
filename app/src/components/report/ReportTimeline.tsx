import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ReportStatus } from '../../types/report.types';

interface TimelineStep {
  status: ReportStatus;
  label: string;
}

const STEPS: TimelineStep[] = [
  { status: 'submitted', label: 'Submitted' },
  { status: 'under_review', label: 'Under Review' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'action_started', label: 'Action Started' },
  { status: 'resolved', label: 'Resolved' },
];

interface ReportTimelineProps {
  currentStatus: ReportStatus;
  historyLogs?: { status: ReportStatus; changedAt: string; remarks?: string }[];
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({ currentStatus, historyLogs = [] }) => {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        const matchedLog = historyLogs.find((log) => log.status === step.status);
        const logDate = matchedLog
          ? new Date(matchedLog.changedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null;

        return (
          <View key={step.status} style={styles.stepRow}>
            {}
            <View style={styles.leftColumn}>
              {}
              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    isCompleted ? styles.connectorCompleted : null,
                  ]}
                />
              ) : null}

              {}
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted ? styles.circleCompleted : null,
                  isCurrent ? styles.circleCurrent : null,
                  isFuture ? styles.circleFuture : null,
                ]}
              >
                {isCompleted ? (
                  <Check size={12} color={Colors.white} strokeWidth={3} />
                ) : isCurrent ? (
                  <View style={styles.currentDot} />
                ) : null}
              </View>
            </View>

            {}
            <View style={styles.rightColumn}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent ? styles.labelCurrent : null,
                    isFuture ? styles.labelFuture : null,
                  ]}
                >
                  {step.label}
                </Text>
                {logDate ? <Text style={styles.logDate}>{logDate}</Text> : null}
              </View>

              {matchedLog?.remarks ? (
                <Text style={styles.remarks} numberOfLines={2}>
                  {matchedLog.remarks}
                </Text>
              ) : isCurrent ? (
                <Text style={styles.placeholderRemarks}>Waiting for next action...</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Colors.spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    ...Colors.shadow.soft,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 65,
  },
  leftColumn: {
    alignItems: 'center',
    width: 30,
    marginRight: Colors.spacing.sm,
  },
  connector: {
    width: 2,
    position: 'absolute',
    top: 24,
    bottom: -16,
    backgroundColor: '#E5E7EB',
  },
  connectorCompleted: {
    backgroundColor: Colors.environmentalGreen,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  circleCompleted: {
    backgroundColor: Colors.environmentalGreen,
    borderColor: Colors.environmentalGreen,
  },
  circleCurrent: {
    backgroundColor: Colors.white,
    borderColor: Colors.primaryBlue,
  },
  circleFuture: {
    backgroundColor: Colors.white,
    borderColor: '#D1D5DB',
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryBlue,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: Colors.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  labelCurrent: {
    color: Colors.primaryBlue,
  },
  labelFuture: {
    color: Colors.grayText,
  },
  logDate: {
    fontSize: 11,
    color: Colors.grayText,
  },
  remarks: {
    fontSize: 13,
    color: Colors.darkText,
    marginTop: 2,
    lineHeight: 17,
  },
  placeholderRemarks: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.grayText,
    marginTop: 2,
  },
});
