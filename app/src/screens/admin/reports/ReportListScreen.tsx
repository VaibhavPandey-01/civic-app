import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
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
import { useSettingsStore } from '../../../context/useSettingsStore';
import { useTranslation } from '../../../hooks/useTranslation';

const STATUS_FILTERS: { id: 'all' | ReportStatus; key: string; defaultLabel: string }[] = [
  { id: 'all', key: 'statusAll', defaultLabel: 'All Statuses' },
  { id: 'submitted', key: 'statusSubmitted', defaultLabel: 'Submitted' },
  { id: 'under_review', key: 'statusUnderReview', defaultLabel: 'Under Review' },
  { id: 'assigned', key: 'statusAssigned', defaultLabel: 'Assigned' },
  { id: 'action_started', key: 'statusActionStarted', defaultLabel: 'In Progress' },
  { id: 'resolved', key: 'statusResolved', defaultLabel: 'Resolved' },
];

const DEPT_FILTERS = [
  { id: 'all', key: 'deptAll', defaultLabel: 'All Departments' },
  { id: 'Municipal Sanitation', key: 'deptSanitation', defaultLabel: 'Municipal Sanitation' },
  { id: 'Police/Emergency', key: 'deptPolice', defaultLabel: 'Police/Emergency' },
];

export const ReportListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all');
  const [selectedDept, setSelectedDept] = useState('all');

  const lastScrollY = useRef(0);
  const setTabBarVisible = useSettingsStore((s) => s.setTabBarVisible);

  useEffect(() => {
    setTabBarVisible(true);
    return () => setTabBarVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 60) {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const searchY = useRef(new Animated.Value(-10)).current;
  const filterY = useRef(new Animated.Value(-10)).current;
  const listY = useRef(new Animated.Value(20)).current;
  const listScale = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    searchY.setValue(-10);
    filterY.setValue(-10);
    listY.setValue(20);
    listScale.setValue(1);
    listOpacity.setValue(1);

    Animated.stagger(70, [
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
      Animated.spring(searchY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(filterY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(listY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFilterChange = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.spring(listScale, {
          toValue: 1,
          tension: 90,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleStatusChange = (status: 'all' | ReportStatus) => {
    animateFilterChange(() => setSelectedStatus(status));
  };

  const handleDeptChange = (dept: string) => {
    animateFilterChange(() => setSelectedDept(dept));
  };

  const handleRefresh = () => {
    Animated.parallel([
      Animated.timing(listScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRefreshing(true);
      fetchReportsData(true).then(() => {
        Animated.parallel([
          Animated.spring(listScale, {
            toValue: 1,
            tension: 85,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(listOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  };

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

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const filteredReports = reports.filter((r) => {
    const categoryName = CATEGORIES.find((c) => c.id === r.category) ? t(r.category as any) : r.category;
    const matchesSearch =
      categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchText.toLowerCase()));
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tabReports' as any) || 'Reports'}</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: searchY }] }}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.grayText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder' as any) || "Search by ID, desc, or location..."}
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
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: filterY }] }}>
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <Text style={styles.filterGroupLabel}>{isHindi ? 'स्थिति:' : 'Status:'}</Text>
            {STATUS_FILTERS.map((item) => {
              const isActive = selectedStatus === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterChip, isActive ? styles.chipActive : null]}
                  onPress={() => handleStatusChange(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                    {t(item.key as any) || item.defaultLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.filterDivider} />

            <Text style={styles.filterGroupLabel}>{isHindi ? 'विभाग:' : 'Dept:'}</Text>
            {DEPT_FILTERS.map((item) => {
              const isActive = selectedDept === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.filterChip, isActive ? styles.chipActive : null]}
                  onPress={() => handleDeptChange(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                    {t(item.key as any) || item.defaultLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }], flex: 1 }}>
        <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }], flex: 1, backgroundColor: 'transparent' }}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primaryBlue} />
            </View>
          ) : filteredReports.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {t('noReportsFound' as any) || 'No reports match your filters.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredReports}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <ReportListItem
                  report={item}
                  onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
                />
              )}
            />
          )}
        </Animated.View>
      </Animated.View>
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
