import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User as UserIcon, Settings, LogOut, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../../context/useAuthStore';
import { logout } from '../../../services/authService';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Card } from '../../../components/common/Card';
import { ProfileStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

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
      
      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profileTitle')}</Text>
      </View>

      <View style={styles.content}>
        {}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <UserIcon size={32} color={Colors.primaryBlue} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.name || 'Citizen'}</Text>
              <Text style={styles.phone}>{user?.phone}</Text>
            </View>
            {user?.verificationStatus === 'verified' && (
              <View style={styles.badge}>
                <CheckCircle2 size={16} color={Colors.environmentalGreen} />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
          </View>

          {user?.email ? (
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Email Address</Text>
              <Text style={styles.emailValue}>{user.email}</Text>
            </View>
          ) : null}

          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              Joined on: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </Card>

        {}
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primaryBlue + '15' }]}>
                <Settings size={18} color={Colors.primaryBlue} />
              </View>
              <Text style={styles.menuLabel}>{t('settingsTab')}</Text>
            </View>
            <ChevronRight size={18} color={Colors.grayText} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.alertOrange + '15' }]}>
                <LogOut size={18} color={Colors.alertOrange} />
              </View>
              <Text style={[styles.menuLabel, styles.logoutLabel]}>{t('logOutBtn')}</Text>
            </View>
            <ChevronRight size={18} color={Colors.grayText} />
          </TouchableOpacity>
        </Card>
      </View>
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
  content: {
    padding: Colors.spacing.md,
    gap: Colors.spacing.md,
  },
  userCard: {
    padding: Colors.spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: Colors.spacing.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  phone: {
    fontSize: 13,
    color: Colors.grayText,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.environmentalGreen,
  },
  emailContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: Colors.spacing.sm,
  },
  emailLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    textTransform: 'uppercase',
  },
  emailValue: {
    fontSize: 14,
    color: Colors.darkText,
    marginTop: 2,
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: Colors.spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: Colors.grayText,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Colors.spacing.md,
  },
  logoutItem: {
    // optional stylistic updates
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
  },
  logoutLabel: {
    color: Colors.alertOrange,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
