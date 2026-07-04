import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { ReportStatus } from '../../types/report.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { updateReportStatus } from '../../services/adminService';

interface StatusUpdaterProps {
  reportId: string;
  currentStatus: ReportStatus;
  onStatusUpdated: () => void;
}

interface StatusOption {
  status: ReportStatus;
  label: string;
}

const OPTIONS: StatusOption[] = [
  { status: 'under_review', label: 'Review' },
  { status: 'assigned', label: 'Assign' },
  { status: 'action_started', label: 'Action' },
];

export const StatusUpdater: React.FC<StatusUpdaterProps> = ({
  reportId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(
    OPTIONS.some((o) => o.status === currentStatus)
      ? currentStatus
      : 'under_review'
  );
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateReportStatus(reportId, selectedStatus, remarks.trim() || undefined);
      Alert.alert('Status Updated', 'The report status has been updated successfully.');
      setRemarks('');
      onStatusUpdated();
    } catch (error: any) {
      console.error('Error updating status:', error);
      Alert.alert('Update Failed', error.message || 'An error occurred while updating status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Status</Text>

      {}
      <View style={styles.segmentContainer}>
        {OPTIONS.map((opt) => {
          const isActive = selectedStatus === opt.status;
          return (
            <TouchableOpacity
              key={opt.status}
              style={[styles.segment, isActive ? styles.segmentActive : null]}
              onPress={() => setSelectedStatus(opt.status)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, isActive ? styles.segmentTextActive : null]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {}
      <Input
        label="Operational Remarks"
        placeholder="Add remarks (e.g. assigned team name, progress updates...)"
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={2}
        style={styles.inputArea}
      />

      <Button
        title="Apply Changes"
        onPress={handleUpdate}
        loading={loading}
        variant="primary"
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
    marginBottom: Colors.spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 3,
    marginBottom: Colors.spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: Colors.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Colors.radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: Colors.white,
    ...Colors.shadow.soft,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  segmentTextActive: {
    color: Colors.primaryBlue,
  },
  inputArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 48,
    marginTop: Colors.spacing.xs,
  },
});
