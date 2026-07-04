import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAnalytics } from '../../../services/adminService';
import { Card } from '../../../components/common/Card';
import { CATEGORIES } from '../../../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, max, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [byStatus, setByStatus] = useState<{ label: string; count: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ label: string; count: number }[]>([]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setTotal(data.totalReports || 0);

      // map status counts
      const statusData = data.byStatus.map((s: any) => ({
        label: s._id.replace('_', ' ').toUpperCase(),
        count: s.count,
      }));
      setByStatus(statusData);

      // map category counts
      const categoryData = data.byCategory.map((c: any) => {
        const cat = CATEGORIES.find((catItem) => catItem.id === c._id);
        return {
          label: cat?.label || c._id,
          count: c.count,
        };
      });
      setByCategory(categoryData);
    } catch (error) {
      console.error('Error loading analytics screen data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxStatus = byStatus.reduce((max, item) => (item.count > max ? item.count : max), 0);
  const maxCategory = byCategory.reduce((max, item) => (item.count > max ? item.count : max), 0);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Analytics</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Platform Traffic</Text>
            <Text style={styles.summaryCount}>{total}</Text>
            <Text style={styles.summarySub}>Incidents recorded on database</Text>
          </Card>

          {}
          <Text style={styles.chartTitle}>Reports by Status</Text>
          <Card style={styles.chartCard}>
            {byStatus.length === 0 ? (
              <Text style={styles.emptyText}>No status statistics available.</Text>
            ) : (
              byStatus.map((item, index) => (
                <ChartBar
                  key={index}
                  label={item.label}
                  value={item.count}
                  max={maxStatus}
                  color={Colors.primaryBlue}
                />
              ))
            )}
          </Card>

          {}
          <Text style={styles.chartTitle}>Reports by Category</Text>
          <Card style={styles.chartCard}>
            {byCategory.length === 0 ? (
              <Text style={styles.emptyText}>No category statistics available.</Text>
            ) : (
              byCategory.map((item, index) => (
                <ChartBar
                  key={index}
                  label={item.label}
                  value={item.count}
                  max={maxCategory}
                  color={Colors.environmentalGreen}
                />
              ))
            )}
          </Card>

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: Colors.spacing.lg,
    marginBottom: Colors.spacing.md,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryCount: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    marginVertical: 4,
  },
  summarySub: {
    fontSize: 11,
    color: Colors.grayText,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    padding: Colors.spacing.md,
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  barLabel: {
    width: 90,
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginRight: Colors.spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    width: 28,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textAlign: 'right',
    marginLeft: Colors.spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    paddingVertical: Colors.spacing.md,
  },
});
