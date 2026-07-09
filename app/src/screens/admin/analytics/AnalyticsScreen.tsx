import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
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
import { useTranslation } from '../../../hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay: number;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, max, color, delay }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const barWidth = useRef(new Animated.Value(0)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(barWidth, {
          toValue: percentage,
          tension: 40,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  const animatedWidth = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.barRow, { opacity: barOpacity }]}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { width: animatedWidth, backgroundColor: color },
          ]}
        />
      </View>
      <View style={styles.valueWrapper}>
        <Text style={styles.barValue}>{value}</Text>
      </View>
    </Animated.View>
  );
};

interface AnimatedStatProps {
  targetValue: number;
  duration?: number;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ targetValue, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animRef.setValue(0);
    const listener = animRef.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    Animated.timing(animRef, {
      toValue: targetValue,
      duration,
      useNativeDriver: false,
    }).start();
    return () => animRef.removeListener(listener);
  }, [targetValue]);

  return <Text style={styles.statVal}>{displayValue}</Text>;
};

interface AnimatedPieChartProps {
  data: { name: string; population: number; color: string; legendFontColor: string; legendFontSize: number }[];
  width: number;
  height: number;
  delay?: number;
}

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({ data, width, height, delay = 600 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { rotate }],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PieChart
        data={data}
        width={width}
        height={height}
        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
        absolute
      />
    </Animated.View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [byStatus, setByStatus] = useState<{ label: string; count: number; rawStatus: string }[]>([]);
  const [byCategory, setByCategory] = useState<{ label: string; count: number; color: string }[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const statsY = useRef(new Animated.Value(15)).current;
  const chart1Y = useRef(new Animated.Value(20)).current;
  const chart2Y = useRef(new Animated.Value(20)).current;
  const contentScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    statsY.setValue(15);
    chart1Y.setValue(20);
    chart2Y.setValue(20);
    contentScale.setValue(1);
    contentOpacity.setValue(1);

    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(headerY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(statsY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(chart1Y, {
        toValue: 0,
        tension: 45,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(chart2Y, {
        toValue: 0,
        tension: 45,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRefresh = () => {
    Animated.parallel([
      Animated.timing(contentScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRefreshing(true);
      loadAnalytics(true).then(() => {
        Animated.parallel([
          Animated.spring(contentScale, {
            toValue: 1,
            tension: 85,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  };

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

      const statusData = data.byStatus.map((s: any) => {
        const raw = s._id;
        const statusKey = `status${raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_([a-z])/g, (g: string) => g[1].toUpperCase())}`;
        return {
          label: t(statusKey as any) || raw.replace('_', ' ').toUpperCase(),
          count: s.count,
          rawStatus: raw,
        };
      });
      setByStatus(statusData);

      const categoryData = data.byCategory.map((c: any) => {
        const cat = CATEGORIES.find((catItem) => catItem.id === c._id);
        const categoryLabel = cat
          ? t(cat.id as any)
          : c._id;
        return {
          label: categoryLabel,
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

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const maxStatus = byStatus.reduce((max, item) => (item.count > max ? item.count : max), 0);

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

  const activeTickets = total - resolvedCount;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t('analyticsTitle' as any) || 'Overview Analytics'}
          </Text>
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
      </Animated.View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      ) : (
        <Animated.View style={{ opacity: contentOpacity, transform: [{ scale: contentScale }], flex: 1, backgroundColor: 'transparent' }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: statsY }] }}>
              <View style={styles.gridContainer}>
                <Card style={[styles.statCard, { borderLeftColor: Colors.primaryBlue, borderLeftWidth: 4 }]}>
                  <View style={styles.statIconWrapper}>
                    <BarChart2 size={20} color={Colors.primaryBlue} />
                  </View>
                  <AnimatedStat targetValue={total} />
                  <Text style={styles.statLabel}>
                    {t('totalReports' as any) || 'Total Reports'}
                  </Text>
                </Card>

                <Card style={[styles.statCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
                  <View style={[styles.statIconWrapper, { backgroundColor: '#FFF7ED' }]}>
                    <Clock size={20} color="#F59E0B" />
                  </View>
                  <AnimatedStat targetValue={activeTickets} />
                  <Text style={styles.statLabel}>
                    {t('pendingIssues' as any) || 'Pending Issues'}
                  </Text>
                </Card>

                <Card style={[styles.statCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
                  <View style={[styles.statIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                    <CheckCircle2 size={20} color="#10B981" />
                  </View>
                  <AnimatedStat targetValue={resolvedCount} />
                  <Text style={styles.statLabel}>
                    {t('resolvedCases' as any) || 'Resolved Cases'}
                  </Text>
                </Card>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: chart1Y }] }}>
              <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <Activity size={16} color={Colors.primaryBlue} />
                  <Text style={styles.chartTitle}>
                    {t('reportsByStatus' as any) || 'Reports by Status'}
                  </Text>
                </View>
                <Card style={styles.chartCard}>
                  {byStatus.length === 0 ? (
                    <Text style={styles.emptyText}>
                      {t('noDataAvailable' as any) || 'No statistics available.'}
                    </Text>
                  ) : (
                    byStatus.map((item, index) => (
                      <ChartBar
                        key={index}
                        label={item.label}
                        value={item.count}
                        max={maxStatus}
                        color={getStatusColor(item.rawStatus)}
                        delay={400 + index * 120}
                      />
                    ))
                  )}
                </Card>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: chart2Y }] }}>
              <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={16} color={Colors.environmentalGreen} />
                  <Text style={styles.chartTitle}>
                    {t('reportsByCategory' as any) || 'Reports by Category'}
                  </Text>
                </View>
                <Card style={styles.chartCard}>
                  {byCategory.length === 0 ? (
                    <Text style={styles.emptyText}>
                      {t('noDataAvailable' as any) || 'No statistics available.'}
                    </Text>
                  ) : (
                    <AnimatedPieChart
                      data={byCategory.map((item) => ({
                        name: item.label,
                        population: item.count,
                        color: item.color,
                        legendFontColor: Colors.darkText,
                        legendFontSize: 10,
                      }))}
                      width={SCREEN_WIDTH - 64}
                      height={180}
                      delay={500}
                    />
                  )}
                </Card>
              </View>
            </Animated.View>

          </ScrollView>
        </Animated.View>
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
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    paddingVertical: Colors.spacing.md,
  },
});
