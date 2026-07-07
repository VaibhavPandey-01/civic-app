import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Info, User as UserIcon, Bell, X, CheckCircle, TrendingUp, Clipboard } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../../context/useAuthStore';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { CATEGORIES } from '../../../constants/categories';
import { CategoryTile } from '../../../components/dashboard/CategoryTile';
import { RecentReportCard } from '../../../components/dashboard/RecentReportCard';
import { getUserReports } from '../../../services/reportService';
import { Report } from '../../../types/report.types';
import { RootStackParamList } from '../../../types/navigation.types';
import { useSettingsStore } from '../../../context/useSettingsStore';

const getCategoryLabelHi = (categoryId: string) => {
  switch (categoryId) {
    case 'garbage_dump':
      return 'कचरा डंप';
    case 'plastic_pollution':
      return 'प्लास्टिक प्रदूषण';
    case 'waste_accumulation':
      return 'कचरा संचय';
    case 'water_pollution':
      return 'जल प्रदूषण';
    case 'suspicious_object':
      return 'संदिग्ध वस्तु';
    case 'emergency_situation':
      return 'आपातकालीन स्थिति';
    default:
      return categoryId;
  }
};

const getRelativeTime = (timestamp: string | number, isHindi: boolean) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (isHindi) {
    if (mins < 1) return 'अभी-अभी';
    if (mins < 60) return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    return `${days} दिन पहले`;
  } else {
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
};

const getNotificationDetails = (status: string, categoryLabel: string, isHindi: boolean) => {
  if (isHindi) {
    switch (status) {
      case 'resolved':
        return {
          title: 'मामला सुलझ गया',
          desc: `आपकी ${categoryLabel} की रिपोर्ट सफलतापूर्वक सुलझा ली गई है।`,
          icon: 'check',
          color: Colors.environmentalGreen,
          bgColor: Colors.environmentalGreen + '15',
        };
      case 'action_started':
        return {
          title: 'कार्रवाई शुरू',
          desc: `आपकी ${categoryLabel} रिपोर्ट पर सफाई का काम शुरू हो गया है।`,
          icon: 'trending',
          color: Colors.alertOrange,
          bgColor: Colors.alertOrange + '15',
        };
      case 'assigned':
        return {
          title: 'अधिकारी नियुक्त',
          desc: `आपकी ${categoryLabel} रिपोर्ट अधिकारी को सौंप दी गई है।`,
          icon: 'trending',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
      case 'under_review':
        return {
          title: 'समीक्षा के अधीन',
          desc: `अधिकारी वर्तमान में ${categoryLabel} की रिपोर्ट की समीक्षा कर रहे हैं।`,
          icon: 'clipboard',
          color: Colors.grayText,
          bgColor: Colors.grayText + '15',
        };
      case 'submitted':
      default:
        return {
          title: 'रिपोर्ट दर्ज',
          desc: `आपकी ${categoryLabel} रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है।`,
          icon: 'clipboard',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
    }
  } else {
    switch (status) {
      case 'resolved':
        return {
          title: 'Incident Resolved',
          desc: `The reported ${categoryLabel} has been successfully resolved.`,
          icon: 'check',
          color: Colors.environmentalGreen,
          bgColor: Colors.environmentalGreen + '15',
        };
      case 'action_started':
        return {
          title: 'Action Initiated',
          desc: `Work has started on your ${categoryLabel} report.`,
          icon: 'trending',
          color: Colors.alertOrange,
          bgColor: Colors.alertOrange + '15',
        };
      case 'assigned':
        return {
          title: 'Officer Assigned',
          desc: `Your report for ${categoryLabel} has been assigned to an officer.`,
          icon: 'trending',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
      case 'under_review':
        return {
          title: 'Report Under Review',
          desc: `Officers are currently reviewing your report for ${categoryLabel}.`,
          icon: 'clipboard',
          color: Colors.grayText,
          bgColor: Colors.grayText + '15',
        };
      case 'submitted':
      default:
        return {
          title: 'Report Registered',
          desc: `Your ${categoryLabel} report has been successfully registered.`,
          icon: 'clipboard',
          color: Colors.primaryBlue,
          bgColor: Colors.primaryBlue + '15',
        };
    }
  }
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CitizenDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isHindi = language === 'hi';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);

  const notifications = reports.map((report) => {
    const categoryItem = CATEGORIES.find((c) => c.id === report.category);
    const categoryLabel = categoryItem
      ? (isHindi && (categoryItem as any).labelHi ? (categoryItem as any).labelHi : categoryItem.label)
      : report.category;
    
    // hindi category mapping fallback
    const resolvedLabel = isHindi ? getCategoryLabelHi(report.category) : categoryLabel;

    const details = getNotificationDetails(report.status, resolvedLabel, isHindi);
    return {
      id: report.id,
      title: details.title,
      desc: details.desc,
      time: getRelativeTime(report.createdAt, isHindi),
      icon: details.icon,
      color: details.color,
      bgColor: details.bgColor,
      updatedAtTime: new Date(report.updatedAt || report.createdAt).getTime(),
    };
  });

  const hasUnseenNotifications = reports.some(
    (report) => new Date(report.updatedAt || report.createdAt).getTime() > lastSeenTimestamp
  );

  useEffect(() => {
    if (reports.length > 0 && lastSeenTimestamp === 0) {
      const latestTime = Math.max(...reports.map(r => new Date(r.updatedAt || r.createdAt).getTime()));
      setLastSeenTimestamp(latestTime);
    }
  }, [reports]);

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

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const notificationsAnim = useRef(new Animated.Value(0)).current;

  const showNotifications = () => {
    setNotificationsVisible(true);
    setLastSeenTimestamp(Date.now());
    notificationsAnim.setValue(0);
    Animated.spring(notificationsAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideNotifications = () => {
    Animated.timing(notificationsAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setNotificationsVisible(false);
    });
  };

  const handleNotificationPress = (reportId: string) => {
    hideNotifications();
    navigation.navigate('CitizenTabs' as any, {
      screen: 'Reports',
      params: {
        screen: 'ReportDetail',
        params: { reportId },
      },
    } as any);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;
  const ctaScale = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const grid1Y = useRef(new Animated.Value(20)).current;
  const grid2Y = useRef(new Animated.Value(20)).current;
  const reportsY = useRef(new Animated.Value(25)).current;

  const runFloatingAnimation = () => {
    floatAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const runWaveAnimation = () => {
    waveAnim.setValue(0);
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    headerY.setValue(-15);
    ctaScale.setValue(0.95);
    grid1Y.setValue(20);
    grid2Y.setValue(20);
    reportsY.setValue(25);

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
      Animated.spring(ctaScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(grid1Y, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(grid2Y, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(reportsY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runFloatingAnimation();
    runWaveAnimation();
  }, []);

  useEffect(() => {
    if (!loading) {
      runEntranceAnimation();
    }
  }, [loading]);

  const loadData = async () => {
    const userId = user?.id || (user as any)?._id;
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getUserReports(userId, 1, 5);
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching dashboard reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, user]);

  const environmentalCategories = CATEGORIES.filter((c) => c.group === 'environmental');
  const safetyCategories = CATEGORIES.filter((c) => c.group === 'safety');

  const startReport = (category?: string) => {
    // navigate to nested reportstack
    if (category) {
      navigation.navigate('ReportStack' as any, {
        screen: 'Camera',
        params: { category: category as any },
      } as any);
    } else {
      navigation.navigate('ReportStack' as any, {
        screen: 'SelectCategory',
      } as any);
    }
  };

  const ctaTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const waveScale1 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.08],
  });
  const waveOpacity1 = waveAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.3, 0.15, 0],
  });
  const waveScale2 = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.0, 1.0, 1.08],
  });
  const waveOpacity2 = waveAnim.interpolate({
    inputRange: [0, 0.5, 0.9, 1],
    outputRange: [0, 0.3, 0.15, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: headerY }] }}>
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: Colors.spacing.sm }}>
              <Text style={styles.greeting}>{t('hello')}, {user?.name || 'Citizen'}</Text>
              <Text style={styles.subGreeting}>{t('cleanSurroundsHint')}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationBtn} onPress={showNotifications} activeOpacity={0.8}>
                <Bell size={20} color={Colors.primaryBlue} />
                {hasUnseenNotifications && <View style={styles.badgeDot} />}
              </TouchableOpacity>
              <View style={styles.avatar}>
                <UserIcon size={20} color={Colors.primaryBlue} />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.ctaCtaContainer, { opacity: fadeAnim, transform: [{ scale: ctaScale }, { translateY: ctaTranslateY }] }]}>
          <Animated.View
            style={[
              styles.ctaCtaWave,
              {
                transform: [{ scale: waveScale1 }],
                opacity: waveOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ctaCtaWave,
              {
                transform: [{ scale: waveScale2 }],
                opacity: waveOpacity2,
              },
            ]}
          />
          <TouchableOpacity style={[styles.ctaCard, { marginBottom: 0 }]} onPress={() => startReport()} activeOpacity={0.95}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>{t('reportAnIncident')}</Text>
              <Text style={styles.ctaSubtitle}>Report emergencies, pollution, or trash instantly.</Text>
            </View>
            <View style={styles.ctaButtonCircle}>
              <Plus size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid1Y }] }}>
          <Text style={styles.sectionTitle}>Environmental Pollution</Text>
          <View style={styles.grid}>
            {environmentalCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => startReport(cat.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: grid2Y }] }}>
          <Text style={styles.sectionTitle}>Safety & Security</Text>
          <View style={styles.grid}>
            {safetyCategories.map((cat) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                onPress={() => startReport(cat.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: reportsY }] }}>
          <Text style={styles.sectionTitle}>{t('recentReports')}</Text>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryBlue} style={styles.loader} />
          ) : reports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('noRecentReports')}</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {reports.map((report) => (
                <View key={report.id} style={styles.reportCardWrapper}>
                  <RecentReportCard
                    report={report}
                    onPress={() => {
                      navigation.navigate('CitizenTabs' as any, {
                        screen: 'Reports',
                        params: {
                          screen: 'ReportDetail',
                          params: { reportId: report.id },
                        },
                      } as any);
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.tipsTeaserCard}>
            <View style={styles.tipsIconCircle}>
              <Info size={18} color={Colors.primaryBlue} />
            </View>
            <View style={styles.tipsTeaserText}>
              <Text style={styles.tipsTeaserTitle}>Did you know?</Text>
              <Text style={styles.tipsTeaserDescription}>
                Safety is our top priority. For safety incidents, keep at least 100 meters distance and alert authorities.
              </Text>
            </View>
          </View>
        </Animated.View>

      </ScrollView>

      <Modal
        visible={notificationsVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={hideNotifications}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideNotifications}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: notificationsAnim }]}>
            <BlurView
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.22)' }]}
              intensity={25}
              tint="dark"
              experimentalBlurMethod={"regular" as any}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: notificationsAnim,
                transform: [
                  { scale: notificationsAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) },
                  { translateY: notificationsAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }
                ]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('notifications')}</Text>
              <TouchableOpacity onPress={hideNotifications}>
                <X size={20} color={Colors.grayText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationScroll} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotificationsContainer}>
                  <Bell size={40} color={Colors.grayText + '44'} style={{ marginBottom: 10 }} />
                  <Text style={styles.emptyNotificationsText}>
                    {isHindi ? 'कोई नई सूचना नहीं' : 'No new notifications'}
                  </Text>
                  <Text style={styles.emptyNotificationsSub}>
                    {isHindi 
                      ? 'जब आपकी रिपोर्ट में अपडेट होंगे तो हम आपको सूचित करेंगे।' 
                      : "We'll alert you when there are updates to your reports."}
                  </Text>
                </View>
              ) : (
                notifications.map((item, index) => {
                  return (
                    <View key={item.id}>
                      {index > 0 && <View style={styles.notificationDivider} />}
                      <TouchableOpacity
                        style={styles.notificationItem}
                        onPress={() => handleNotificationPress(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.notificationIconContainer, { backgroundColor: item.bgColor }]}>
                          {item.icon === 'check' ? (
                            <CheckCircle size={18} color={item.color} />
                          ) : item.icon === 'trending' ? (
                            <TrendingUp size={18} color={item.color} />
                          ) : (
                            <Clipboard size={18} color={item.color} />
                          )}
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationItemTitle}>{item.title}</Text>
                          <Text style={styles.notificationItemDesc}>{item.desc}</Text>
                          <Text style={styles.notificationItemTime}>{item.time}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: Colors.spacing.lg,
    marginTop: Colors.spacing.xs,
  },
  greeting: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.grayText,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    ...Colors.shadow.soft,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.alertOrange,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Colors.spacing.lg,
  },
  modalCard: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.lg,
    padding: Colors.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: '75%',
    ...Colors.shadow.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  notificationScroll: {
    marginTop: Colors.spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Colors.spacing.xs,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 2,
  },
  notificationItemDesc: {
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationItemTime: {
    fontSize: 10,
    color: Colors.grayText + '99',
  },
  notificationDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: Colors.spacing.sm,
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Colors.spacing.xl,
  },
  emptyNotificationsText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  emptyNotificationsSub: {
    fontSize: 12,
    color: Colors.grayText,
    textAlign: 'center',
    paddingHorizontal: Colors.spacing.lg,
  },
  ctaCtaContainer: {
    position: 'relative',
    marginBottom: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaCtaWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  ctaCard: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Colors.shadow.medium,
  },
  ctaTextContainer: {
    flex: 1,
    marginRight: Colors.spacing.sm,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 16,
  },
  ctaButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
    marginTop: Colors.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Colors.spacing.md,
    marginHorizontal: -Colors.spacing.xs,
  },
  loader: {
    marginVertical: Colors.spacing.lg,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  horizontalScroll: {
    paddingRight: Colors.spacing.md,
    marginBottom: Colors.spacing.md,
  },
  reportCardWrapper: {
    width: 290,
    marginRight: Colors.spacing.sm,
  },
  tipsTeaserCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    alignItems: 'center',
    marginTop: Colors.spacing.xs,
  },
  tipsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Colors.spacing.md,
  },
  tipsTeaserText: {
    flex: 1,
  },
  tipsTeaserTitle: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  tipsTeaserDescription: {
    fontSize: 12,
    color: Colors.grayText,
    lineHeight: 16,
    marginTop: 2,
  },
});
