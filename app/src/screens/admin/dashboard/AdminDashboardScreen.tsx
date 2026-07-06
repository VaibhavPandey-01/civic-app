import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Map, RefreshCw, BarChart2, ShieldAlert, CheckCircle, LogOut, User, X, Globe, Mail, Shield } from 'lucide-react-native';
import { useAuthStore } from '../../../context/useAuthStore';
import { useSettingsStore } from '../../../context/useSettingsStore';
import { logout } from '../../../services/authService';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { getAnalytics, getAllReports } from '../../../services/adminService';
import { AnalyticsCard } from '../../../components/admin/AnalyticsCard';
import { ReportListItem } from '../../../components/admin/ReportListItem';
import { Report } from '../../../types/report.types';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<any>;

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const { language, setLanguage } = useSettingsStore();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(20)).current;
  const listY = useRef(new Animated.Value(20)).current;
  const mapScale = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const runEntranceAnimation = () => {
    fadeAnim.setValue(0);
    statsY.setValue(20);
    listY.setValue(20);
    mapScale.setValue(0.95);

    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(mapScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(statsY, {
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, reportsData] = await Promise.all([
        getAnalytics(),
        getAllReports({ limit: 5 }),
      ]);

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
    runEntranceAnimation();
    runFloatingAnimation();
    runWaveAnimation();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
      runEntranceAnimation();
      runFloatingAnimation();
      runWaveAnimation();
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

  const mapTranslateY = floatAnim.interpolate({
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: statsY }] }]}>
          <View style={{ flex: 1, marginRight: Colors.spacing.sm }}>
            <Text style={styles.greeting}>Authority Hub</Text>
            <Text style={styles.adminName}>Welcome, {user?.name || 'Officer'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.profileBtn} onPress={() => setProfileVisible(true)} activeOpacity={0.8}>
              <User size={20} color={Colors.primaryBlue} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut size={20} color={Colors.alertOrange} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.mapCtaContainer, { opacity: fadeAnim, transform: [{ scale: mapScale }, { translateY: mapTranslateY }] }]}>
          <Animated.View
            style={[
              styles.mapCtaWave,
              {
                transform: [{ scale: waveScale1 }],
                opacity: waveOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.mapCtaWave,
              {
                transform: [{ scale: waveScale2 }],
                opacity: waveOpacity2,
              },
            ]}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mapCta}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Colors.spacing.md,
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  borderWidth: 0,
                }}
              >
                <Map size={24} color={Colors.white} />
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0)', borderWidth: 0 }}>
                  <Text style={styles.mapCtaTitle}>Incident Live Map</Text>
                  <Text style={styles.mapCtaSub} numberOfLines={2}>
                    View reported issues coordinates on dynamic map view
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: statsY }] }}>
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
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: listY }] }}>
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
        </Animated.View>

      </ScrollView>

      <Modal
        visible={profileVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProfileVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Officer Profile</Text>
              <TouchableOpacity onPress={() => setProfileVisible(false)}>
                <X size={20} color={Colors.grayText} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'OF'}
                </Text>
              </View>
              <Text style={styles.profileName}>{user?.name || 'Officer'}</Text>
              <View style={styles.roleBadge}>
                <Shield size={12} color={Colors.primaryBlue} style={{ marginRight: 4 }} />
                <Text style={styles.roleBadgeText}>Officer / Admin</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Mail size={16} color={Colors.grayText} style={{ marginRight: 8 }} />
                <Text style={styles.detailText}>{user?.phone || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>App Language / भाषा</Text>
              <View style={styles.languageToggleContainer}>
                <TouchableOpacity
                  style={[styles.langBtn, language === 'en' ? styles.langBtnActive : null]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.langText, language === 'en' ? styles.langTextActive : null]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, language === 'hi' ? styles.langBtnActive : null]}
                  onPress={() => setLanguage('hi')}
                >
                  <Text style={[styles.langText, language === 'hi' ? styles.langTextActive : null]}>HI</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalLogoutBtn}
              onPress={() => {
                setProfileVisible(false);
                handleLogout();
              }}
              activeOpacity={0.8}
            >
              <LogOut size={16} color={Colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.modalLogoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 100,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
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
  mapCtaContainer: {
    position: 'relative',
    marginBottom: Colors.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mapCtaWave: {
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
  mapCta: {
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Colors.shadow.medium,
  },
  mapCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
    flex: 1,
  },
  mapCtaTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  mapCtaSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: Colors.spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryBlue,
    marginBottom: Colors.spacing.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  profileName: {
    fontSize: 17,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Colors.spacing.md,
  },
  detailsSection: {
    paddingVertical: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.grayText,
  },
  settingsSection: {
    marginBottom: Colors.spacing.md,
  },
  settingsTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  languageToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    height: 38,
    borderRadius: Colors.radius.sm,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  langBtnActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  langText: {
    fontSize: 12,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.bold,
  },
  langTextActive: {
    color: Colors.white,
  },
  modalLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.alertOrange,
    height: 44,
    borderRadius: Colors.radius.sm,
    marginTop: Colors.spacing.sm,
  },
  modalLogoutText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 14,
  },
});
