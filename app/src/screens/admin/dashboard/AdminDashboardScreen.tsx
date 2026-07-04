import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Map, RefreshCw, BarChart2, ShieldAlert, CheckCircle, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../../context/useAuthStore';
import { logout } from '../../../services/authService';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAnalytics, getAllReports } from '../../../services/adminService';
import { AnalyticsCard } from '../../../components/admin/AnalyticsCard';
import { ReportListItem } from '../../../components/admin/ReportListItem';
import { Report } from '../../../types/report.types';

type NavigationProp = NativeStackNavigationProp<any>;

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, reportsData] = await Promise.all([
        getAnalytics(),
        getAllReports({ limit: 5 }), // fetch top 5 recent reports
      ]);

      // calculate totals
      const total = analyticsData.totalReports;
      const resolved = analyticsData.byStatus.find((s) => s._id === 'resolved')?.count || 0;
      const pending = total - resolved;

      const highCategoryCount =
        analyticsData.byCategory.find((c) => c._id === 'emergency_situation')?.count || 0;

      setStats({
        total,
        pending,
        resolved,
        highPriority: highCategoryCount,
      });
      setRecentReports(reportsData.reports || []);
    } catch (error) {
      console.error('Error loading admin dashboard details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: Colors.spacing.sm }}>
            <Text style={styles.greeting}>Authority Hub</Text>
            <Text style={styles.adminName}>Welcome, {user?.name || 'Officer'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={20} color={Colors.alertOrange} />
          </TouchableOpacity>
        </View>

        {}
        <TouchableOpacity
          style={styles.mapCta}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.9}
        >
          <View style={styles.mapCtaLeft}>
            <Map size={24} color={Colors.white} />
            <View>
              <Text style={styles.mapCtaTitle}>Incident Live Map</Text>
              <Text style={styles.mapCtaSub}>View reported issues coordinates on dynamic map view</Text>
            </View>
          </View>
        </TouchableOpacity>

        {}
        <Text style={styles.sectionTitle}>Overview Analytics</Text>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primaryBlue} style={styles.loader} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <AnalyticsCard
                count={stats.total}
                label="Total Reports"
                iconName="BarChart2"
                iconColor={Colors.primaryBlue}
                bgColor="#EFF6FF"
              />
              <AnalyticsCard
                count={stats.pending}
                label="Pending Issues"
                iconName="ShieldAlert"
                iconColor={Colors.alertOrange}
                bgColor="#FFF7ED"
              />
            </View>
            <View style={styles.statsRow}>
              <AnalyticsCard
                count={stats.resolved}
                label="Resolved Cases"
                iconName="CheckCircle"
                iconColor={Colors.environmentalGreen}
                bgColor="#F0FDF4"
              />
              <AnalyticsCard
                count={stats.highPriority}
                label="Safety Emergencies"
                iconName="ShieldAlert"
                iconColor={Colors.alertOrange}
                bgColor="#FFFBEB"
              />
            </View>
          </View>
        )}

        {}
        <View style={styles.reportsHeader}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          <TouchableOpacity onPress={loadDashboardData} style={styles.refreshBtn}>
            <RefreshCw size={14} color={Colors.primaryBlue} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primaryBlue} style={styles.loader} />
        ) : recentReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reports require attention right now.</Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {recentReports.map((report) => (
              <ReportListItem
                key={report.id}
                report={report}
                onPress={() =>
                  navigation.navigate('Reports', {
                    screen: 'ReportDetail',
                    params: { reportId: report.id },
                  })
                }
              />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  adminName: {
    fontSize: 13,
    color: Colors.grayText,
    marginTop: 2,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.soft,
  },
  mapCta: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Colors.spacing.lg,
    ...Colors.shadow.medium,
  },
  mapCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
  },
  mapCtaTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  mapCtaSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loader: {
    marginVertical: Colors.spacing.lg,
  },
  statsContainer: {
    gap: 8,
    marginBottom: Colors.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.xs,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  reportsList: {
    marginTop: Colors.spacing.xs,
  },
});
