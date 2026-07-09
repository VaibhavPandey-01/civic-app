import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Linking,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Navigation, Filter, Layers } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAllReports } from '../../../services/adminService';
import { getCurrentLocation } from '../../../services/locationService';
import { Card } from '../../../components/common/Card';
import { Report } from '../../../types/report.types';
import { CATEGORIES } from '../../../constants/categories';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettingsStore } from '../../../context/useSettingsStore';

type NavigationProp = NativeStackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 18.9400,
  longitude: 72.8200,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const LiveMapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(DEFAULT_REGION);

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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const filterY = useRef(new Animated.Value(-10)).current;
  const listY = useRef(new Animated.Value(20)).current;
  const listScale = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-20);
    filterY.setValue(-10);
    listY.setValue(20);
    listScale.setValue(1);
    listOpacity.setValue(1);

    Animated.stagger(80, [
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

  const updateStatusFilter = (newStatus: 'all' | 'pending' | 'resolved') => {
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
      setStatusFilter(newStatus);
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

  const updateCategoryFilter = (newCategory: string) => {
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
      setCategoryFilter(newCategory);
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

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && report.status !== 'resolved') ||
      (statusFilter === 'resolved' && report.status === 'resolved');

    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  const initMapData = async () => {
    try {
      setLoading(true);

      const loc = await getCurrentLocation();
      if (loc) {
        setRegion({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }

      const data = await getAllReports({ limit: 100 });
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching live map details:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        runEntranceAnimation();
      }, 50);
    }
  };

  useEffect(() => {
    initMapData();
  }, []);

  const handleMarkerPress = (report: Report) => {
    setSelectedReport(report);
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={styles.loaderText}>    Loading live map coordinates...</Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: Colors.spacing.md, paddingTop: insets.top + Colors.spacing.md, backgroundColor: Colors.background }}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Colors.spacing.sm }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.darkText }}>{t('incidentTracker')}</Text>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <X size={20} color={Colors.darkText} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: filterY }], zIndex: 10 }}>
            <View style={styles.filterSection}>
              <View style={styles.statusRow}>
                <Filter size={16} color={Colors.grayText} style={{ marginRight: 6 }} />
                {(['all', 'pending', 'resolved'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusTab,
                      statusFilter === status && styles.statusTabActive,
                    ]}
                    onPress={() => updateStatusFilter(status)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.statusTabText,
                        statusFilter === status && styles.statusTabTextActive,
                      ]}
                    >
                      {status === 'all'
                        ? t('all')
                        : status === 'pending'
                          ? t('pending')
                          : t('resolved')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    categoryFilter === 'all' && styles.categoryChipActive,
                  ]}
                  onPress={() => updateCategoryFilter('all')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      categoryFilter === 'all' && styles.categoryChipTextActive,
                    ]}
                  >
                    {t('allCategories')}
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      categoryFilter === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => updateCategoryFilter(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        categoryFilter === cat.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {t(cat.id as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }], flex: 1, width: '100%' }}>
            <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }], flex: 1, width: '100%', backgroundColor: 'transparent' }}>
              {filteredReports.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Colors.spacing.lg }}>
                  <Text style={{ fontSize: 14, color: Colors.grayText, textAlign: 'center' }}>{t('noIncidentsFound')}</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Colors.spacing.xl }} onScroll={handleScroll} scrollEventThrottle={16}>
                  {filteredReports.map((report) => {
                    const matchedCat = CATEGORIES.find(c => c.id === report.category);
                    return (
                      <Card key={report.id} style={{ padding: Colors.spacing.md, marginBottom: Colors.spacing.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.darkText }}>
                              {matchedCat ? t(matchedCat.id as any) : report.category}
                            </Text>
                            <Text style={{ fontSize: 12, color: Colors.grayText, marginTop: 2 }}>
                              GPS: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                            </Text>
                          </View>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: Colors.radius.sm,
                            backgroundColor: report.status === 'resolved' ? '#ECFDF5' : '#FEF3C7'
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: 'bold',
                              color: report.status === 'resolved' ? '#059669' : '#D97706'
                            }}>
                              {getStatusLabel(report.status)}
                            </Text>
                          </View>
                        </View>

                        {report.description ? (
                          <Text style={{ fontSize: 13, color: Colors.darkText, marginTop: Colors.spacing.xs, lineHeight: 18 }} numberOfLines={2}>
                            {report.description}
                          </Text>
                        ) : null}

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: Colors.spacing.sm }}>
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: Colors.primaryBlue,
                              borderRadius: Colors.radius.sm,
                              paddingVertical: 8,
                              paddingHorizontal: Colors.spacing.md,
                              gap: 6
                            }}
                            activeOpacity={0.8}
                            onPress={() => {
                              const url = Platform.select({
                                ios: `maps:0,0?q=${report.latitude},${report.longitude}`,
                                android: `geo:0,0?q=${report.latitude},${report.longitude}(Incident)`,
                              }) || `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
                              Linking.openURL(url).catch((err) => console.error('Failed to open map app:', err));
                            }}
                          >
                            <Navigation size={14} color={Colors.white} />
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.white }}>
                              {t('openMap')}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: Colors.white,
                              borderColor: '#E5E7EB',
                              borderWidth: 1,
                              borderRadius: Colors.radius.sm,
                              paddingVertical: 8,
                              paddingHorizontal: Colors.spacing.md,
                              justifyContent: 'center'
                            }}
                            activeOpacity={0.8}
                            onPress={() => {
                              navigation.navigate('Reports', {
                                screen: 'ReportDetail',
                                params: { reportId: report.id },
                              });
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: 'semibold', color: Colors.darkText }}>
                              {t('viewDetails')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </Card>
                    );
                  })}
                </ScrollView>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterSection: {
    marginBottom: Colors.spacing.md,
    backgroundColor: Colors.white,
    padding: Colors.spacing.sm,
    borderRadius: Colors.radius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    paddingHorizontal: 2,
  },
  statusTab: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTabActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  statusTabTextActive: {
    color: Colors.white,
  },
  categoryScroll: {
    marginTop: 2,
  },
  categoryScrollContent: {
    paddingHorizontal: 2,
    paddingRight: 10,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grayText,
  },
  categoryChipTextActive: {
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Colors.spacing.sm,
  },
  loaderText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  mapWrapper: {
    flex: 1,
  },
  floatingClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Colors.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.medium,
  },
  previewPanel: {
    position: 'absolute',
    bottom: Colors.spacing.lg,
    left: Colors.spacing.md,
    right: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    ...Colors.shadow.medium,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  panelContent: {
    flexDirection: 'row',
    marginBottom: Colors.spacing.md,
  },
  panelThumbnail: {
    width: 60,
    height: 60,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#E5E7EB',
  },
  panelMeta: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  panelCategory: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  panelStatus: {
    fontSize: 12,
    color: Colors.grayText,
    marginTop: 2,
  },
  statusBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  panelCoords: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 4,
  },
  detailsBtn: {
    height: 44,
    borderRadius: Colors.radius.sm,
    backgroundColor: Colors.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailsBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 14,
  },
});
