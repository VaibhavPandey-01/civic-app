import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Languages } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Card } from '../../../components/common/Card';
import { useSettingsStore } from '../../../context/useSettingsStore';
import { useTranslation } from '../../../hooks/useTranslation';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { pushEnabled, language, togglePush, setLanguage } = useSettingsStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={Colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {}
        <Card style={styles.settingsCard}>
          {}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primaryBlue + '15' }]}>
                <Bell size={18} color={Colors.primaryBlue} />
              </View>
              <View>
                <Text style={styles.settingLabel}>{t('pushNotificationsLabel')}</Text>
                <Text style={styles.settingSub}>{t('pushNotificationsSub')}</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={togglePush}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={pushEnabled ? Colors.primaryBlue : '#F3F4F6'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          <View style={styles.divider} />

          {}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.environmentalGreen + '15' }]}>
                <Languages size={18} color={Colors.environmentalGreen} />
              </View>
              <View>
                <Text style={styles.settingLabel}>{t('appLanguageLabel')}</Text>
                <Text style={styles.settingSub}>{t('appLanguageSub')}</Text>
              </View>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Colors.spacing.md,
    paddingVertical: Colors.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  placeholder: {
    width: 28,
  },
  content: {
    padding: Colors.spacing.md,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Colors.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Colors.spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.grayText,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  languageToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Colors.radius.sm - 2,
  },
  langBtnActive: {
    backgroundColor: Colors.white,
    ...Colors.shadow.soft,
  },
  langText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
  },
  langTextActive: {
    color: Colors.primaryBlue,
  },
});
