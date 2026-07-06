import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, X, Filter } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAllReports } from '../../../services/adminService';
import { ReportListItem } from '../../../components/admin/ReportListItem';
import { Report, ReportStatus } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';

// available filters
const STATUS_FILTERS: { id: 'all' | ReportStatus; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'action_started', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

const DEPT_FILTERS = [
  { id: 'all', label: 'All Departments' },
  { id: 'Municipal Sanitation', label: 'Municipal Sanitation' },
  { id: 'Police/Emergency', label: 'Police/Emergency' },
];

export const ReportListScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // active filters
  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all');
  const [selectedDept, setSelectedDept] = useState('all');

  const fetchReportsData = async (isARefresh = false) => {
    try {
      if (!isARefresh) setLoading(true);

      const filters: any = {
        limit: 50,
      };

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      if (selectedDept !== 'all') {
        filters.department = selectedDept;
      }

      const data = await getAllReports(filters);
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching admin reports list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [selectedStatus, selectedDept]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportsData(true);
  };

  const filteredReports = reports.filter((r) => {
    const categoryName = CATEGORIES.find((c) => c.id === r.category)?.label || r.category;
    const matchesSearch =
      categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchText.toLowerCase()));
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Reports</Text>
      </View>

      {}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.grayText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by description or category..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.grayText}
            returnKeyType="done"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={18} color={Colors.grayText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {}
          <Text style={styles.filterGroupLabel}>Status:</Text>
          {STATUS_FILTERS.map((item) => {
            const isActive = selectedStatus === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterChip, isActive ? styles.chipActive : null]}
                onPress={() => setSelectedStatus(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.filterDivider} />

          {}
          <Text style={styles.filterGroupLabel}>Dept:</Text>
          {DEPT_FILTERS.map((item) => {
            const isActive = selectedDept === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterChip, isActive ? styles.chipActive : null]}
                onPress={() => setSelectedDept(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No reports found matching your parameters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <ReportListItem
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
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    height: 44,
    paddingHorizontal: Colors.spacing.md,
  },
  searchIcon: {
    marginRight: Colors.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkText,
  },
  filtersWrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: Colors.spacing.xs,
  },
  filtersScroll: {
    paddingHorizontal: Colors.spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
  },
  filterChip: {
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: Colors.primaryBlue,
  },
  chipText: {
    fontSize: 12,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  chipTextActive: {
    color: Colors.white,
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Colors.spacing.lg,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
  },
  listContent: {
    padding: Colors.spacing.md,
    paddingBottom: 100,
  },
});
