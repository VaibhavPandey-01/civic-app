import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Info, User as UserIcon } from 'lucide-react-native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CitizenDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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
    // reload dashboard on mount
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: Colors.spacing.sm }}>
            <Text style={styles.greeting}>{t('hello')}, {user?.name || 'Citizen'}</Text>
            <Text style={styles.subGreeting}>{t('cleanSurroundsHint')}</Text>
          </View>
          <View style={styles.avatar}>
            <UserIcon size={20} color={Colors.primaryBlue} />
          </View>
        </View>

        {}
        <TouchableOpacity style={styles.ctaCard} onPress={() => startReport()} activeOpacity={0.95}>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>{t('reportAnIncident')}</Text>
            <Text style={styles.ctaSubtitle}>Report emergencies, pollution, or trash instantly.</Text>
          </View>
          <View style={styles.ctaButtonCircle}>
            <Plus size={24} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {}
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

        {}
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

                    console.log('Open report details for ID:', report.id);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {}
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
  ctaCard: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Colors.radius.md,
    padding: Colors.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Colors.spacing.lg,
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
