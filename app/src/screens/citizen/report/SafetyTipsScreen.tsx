import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle } from 'lucide-react-native';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../../components/common/Button';
import { PreventionTips } from '../../../components/report/PreventionTips';
import { ReportStackParamList } from '../../../types/navigation.types';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'SafetyTips'>;
type ScreenRouteProp = RouteProp<ReportStackParamList, 'SafetyTips'>;

export const SafetyTipsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { t } = useTranslation();
  const { category } = route.params;

  const handleDone = () => {
    navigation.getParent()?.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.successHeader}>
          <View style={styles.iconCircle}>
            <CheckCircle size={48} color={Colors.environmentalGreen} />
          </View>
          <Text style={styles.title}>{t('success')}</Text>
          <Text style={styles.subtitle}>
            Your incident report has been submitted to the authorities. Thank you for making our community safe!
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsHeading}>Safety Guidelines & Precautions</Text>
          <Text style={styles.tipsSubheading}>
            Please follow these guidelines based on the category you reported:
          </Text>
          <PreventionTips category={category} />
        </View>

        <Button
          title="Go to Home"
          onPress={handleDone}
          variant="primary"
          style={styles.doneBtn}
        />
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
    padding: Colors.spacing.lg,
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.environmentalGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Colors.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Colors.spacing.md,
  },
  tipsSection: {
    width: '100%',
    marginBottom: 40,
  },
  tipsHeading: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 4,
  },
  tipsSubheading: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: Colors.spacing.md,
    lineHeight: 18,
  },
  doneBtn: {
    width: '100%',
  },
});
