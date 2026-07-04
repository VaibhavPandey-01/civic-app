import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { getUserReports } from '../../../services/reportService';
import { useAuthStore } from '../../../context/useAuthStore';
import { Report, ReportStatus } from '../../../types/report.types';
import { RecentReportCard } from '../../../components/dashboard/RecentReportCard';
import { ReportsStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportsStackParamList, 'ReportList'>;

interface FilterChip {
  id: 'all' | ReportStatus;
  label: string;
}

const CHIPS: FilterChip[] = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'action_started', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

export const ReportTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeChip, setActiveChip] = useState<'all' | ReportStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async (isARefresh = false) => {
    if (!user) return;
    try {
      if (!isARefresh) setLoading(true);
      const data = await getUserReports(user.id, 1, 50); // fetch up to 50 reports for simplicity
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error loading tracked reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReports(true);
    });
    return unsubscribe;
  }, [navigation, user]);

  useEffect(() => {
    if (activeChip === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === activeChip));
    }
  }, [activeChip, reports]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('trackReportsTitle')}</Text>
      </View>

      {}
      <View style={styles.chipsContainer}>
        <FlatList
          data={CHIPS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chipsContent}
          renderItem={({ item }) => {
            const isActive = activeChip === item.id;
            return (
              <TouchableOpacity
                style={[styles.chip, isActive ? styles.chipActive : null]}
                onPress={() => setActiveChip(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('noReportsYet')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <RecentReportCard
              report={item}
              onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
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
  chipsContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chipsContent: {
    paddingHorizontal: Colors.spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: Colors.primaryBlue,
  },
  chipText: {
    fontSize: 13,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  chipTextActive: {
    color: Colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.grayText,
    textAlign: 'center',
  },
  listContent: {
    padding: Colors.spacing.md,
    paddingBottom: Colors.spacing.xl,
  },
});
