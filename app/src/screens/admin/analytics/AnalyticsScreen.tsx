import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  BarChart2, 
  Activity, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  TrendingUp
} from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
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
      <View style={styles.valueWrapper}>
        <Text style={styles.barValue}>{value}</Text>
      </View>
    </View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [byStatus, setByStatus] = useState<{ label: string; count: number; rawStatus: string }[]>([]);
  const [byCategory, setByCategory] = useState<{ label: string; count: number; color: string }[]>([]);

  const loadAnalytics = async (isRef = false) => {
    try {
      if (isRef) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await getAnalytics();
      setTotal(data.totalReports || 0);

      const resolved = data.byStatus.find((s: any) => s._id === 'resolved')?.count || 0;
      setResolvedCount(resolved);

      const statusData = data.byStatus.map((s: any) => ({
        label: s._id.replace('_', ' ').toUpperCase(),
        count: s.count,
        rawStatus: s._id,
      }));
      setByStatus(statusData);

      const categoryData = data.byCategory.map((c: any) => {
        const cat = CATEGORIES.find((catItem) => catItem.id === c._id);
        return {
          label: cat?.label || c._id,
          count: c.count,
          color: cat?.color || Colors.primaryBlue,
        };
      }).sort((a, b) => b.count - a.count);
      setByCategory(categoryData);

    } catch (error) {
      console.error('Error loading analytics screen data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  const maxStatus = byStatus.reduce((max, item) => (item.count > max ? item.count : max), 0);
  const maxCategory = byCategory.reduce((max, item) => (item.count > max ? item.count : max), 0);

  const getStatusColor = (rawStatus: string) => {
    switch (rawStatus) {
      case 'submitted':
        return '#9CA3AF';
      case 'under_review':
        return '#60A5FA';
      case 'assigned':
        return '#A78BFA';
      case 'action_started':
        return '#F59E0B';
      case 'resolved':
        return '#10B981';
      default:
        return Colors.primaryBlue;
    }
  };

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const activeTickets = total - resolvedCount;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Analytics</Text>
        <TouchableOpacity 
          style={styles.refreshBtn} 
          onPress={handleRefresh} 
          disabled={loading || refreshing}
          activeOpacity={0.8}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={Colors.primaryBlue} />
          ) : (
            <RefreshCw size={18} color={Colors.primaryBlue} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.gridContainer}>
            <Card style={[styles.statCard, { borderLeftColor: Colors.primaryBlue, borderLeftWidth: 4 }]}>
              <View style={styles.statIconWrapper}>
                <BarChart2 size={20} color={Colors.primaryBlue} />
              </View>
              <Text style={styles.statVal}>{total}</Text>
              <Text style={styles.statLabel}>Total Load</Text>
            </Card>

            <Card style={[styles.statCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FFF7ED' }]}>
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statVal}>{activeTickets}</Text>
              <Text style={styles.statLabel}>Active Cases</Text>
            </Card>

            <Card style={[styles.statCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                <CheckCircle2 size={20} color="#10B981" />
              </View>
              <Text style={styles.statVal}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolved Cases</Text>
            </Card>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <Activity size={16} color={Colors.primaryBlue} />
              <Text style={styles.chartTitle}>Reports by Status</Text>
            </View>
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
                    color={getStatusColor(item.rawStatus)}
                  />
                ))
              )}
            </Card>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={Colors.environmentalGreen} />
              <Text style={styles.chartTitle}>Incidents by Category</Text>
            </View>
            <Card style={styles.chartCard}>
              {byCategory.length === 0 ? (
                <Text style={styles.emptyText}>No category statistics available.</Text>
              ) : (
                <View style={styles.pieContainer}>
                  <PieChart
                    data={byCategory.map((item) => ({
                      name: item.label,
                      population: item.count,
                      color: item.color,
                      legendFontColor: Colors.darkText,
                      legendFontSize: 10,
                    }))}
                    width={SCREEN_WIDTH - 64}
                    height={180}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"10"}
                    absolute
                  />
                </View>
              )}
            </Card>
          </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  refreshBtn: {
    padding: 6,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: Colors.spacing.sm,
    marginBottom: Colors.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.sm,
    borderBottomLeftRadius: Colors.radius.sm,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statVal: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  chartSection: {
    marginBottom: Colors.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.sm,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    padding: Colors.spacing.md,
    gap: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  barLabel: {
    width: 95,
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
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 55,
    justifyContent: 'flex-end',
    marginLeft: Colors.spacing.sm,
  },
  barValue: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  barPercent: {
    fontSize: 9,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: 3,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    paddingVertical: Colors.spacing.md,
  },
});
