import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { Camera, MapPin, AlertTriangle, Shield } from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../context/useSettingsStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const OceanWave: React.FC = () => (
  <Svg
    width="100%"
    height={140}
    viewBox="0 0 400 140"
  >
    {}
    <Path
      d="M0,80 C60,40 120,120 200,80 C280,40 340,120 400,80 L400,140 L0,140 Z"
      fill={Colors.environmentalGreen}
      opacity={0.25}
    />
    {}
    <Path
      d="M0,100 C80,60 150,130 240,95 C320,65 370,115 400,100 L400,140 L0,140 Z"
      fill={Colors.primaryBlue}
      opacity={0.18}
    />
    {}
    <Ellipse cx="200" cy="130" rx="180" ry="12" fill={Colors.primaryBlue} opacity={0.06} />
  </Svg>
);

interface IconBubbleProps {
  children: React.ReactNode;
  color: string;
}

const IconBubble: React.FC<IconBubbleProps> = ({ children, color }) => (
  <View style={[styles.iconBubble, { backgroundColor: color + '18' }]}>
    {children}
  </View>
);

// splashscreen

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const [langModalVisible, setLangModalVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {

      Animated.timing(iconsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim, scaleAnim, iconsAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Language / भाषा चुनें</Text>
            <Text style={styles.modalSub}>Select your preferred display language:</Text>
            
            <TouchableOpacity 
              style={[styles.langOptionCard, language === 'en' ? styles.langOptionActive : null]}
              onPress={() => {
                setLanguage('en');
                setLangModalVisible(false);
              }}
            >
              <Text style={[styles.langOptionText, language === 'en' ? styles.langOptionTextActive : null]}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langOptionCard, language === 'hi' ? styles.langOptionActive : null]}
              onPress={() => {
                setLanguage('hi');
                setLangModalVisible(false);
              }}
            >
              <Text style={[styles.langOptionText, language === 'hi' ? styles.langOptionTextActive : null]}>हिंदी (Hindi)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.langToggle}>
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

      <View style={styles.container}>

        {}
        <Animated.View style={[styles.iconsRow, { opacity: iconsAnim }]}>
          <IconBubble color={Colors.primaryBlue}>
            <Camera size={22} color={Colors.primaryBlue} />
          </IconBubble>
          <IconBubble color={Colors.environmentalGreen}>
            <MapPin size={22} color={Colors.environmentalGreen} />
          </IconBubble>
          <IconBubble color={Colors.alertOrange}>
            <AlertTriangle size={22} color={Colors.alertOrange} />
          </IconBubble>
          <IconBubble color={Colors.primaryBlue}>
            <Shield size={22} color={Colors.primaryBlue} />
          </IconBubble>
        </Animated.View>

        {}
        <Animated.View
          style={[
            styles.logoBlock,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {}
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner}>
              <Text style={styles.logoEmoji}>🌏</Text>
            </View>
          </View>

          <Text style={styles.brandName}>CivicSafe</Text>
          <Text style={styles.tagline}>{t('slogan')}</Text>
        </Animated.View>

        {}
        <View style={styles.waveContainer}>
          <OceanWave />
        </View>

        {}
        <Animated.View style={[styles.ctaContainer, { opacity: iconsAnim }]}>
          <Button
            title={t('getStarted')}
            onPress={() => navigation.navigate('Onboarding')}
            variant="primary"
            style={styles.ctaButton}
          />
          <Text style={styles.loginHint}>
            {t('alreadyHaveAccount')}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              {t('logIn')}{' '}
            </Text>
          </Text>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Colors.spacing.xl,
    paddingTop: Colors.spacing.xl,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: Colors.spacing.md,
    marginBottom: Colors.spacing.xl,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26, // perfect circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: Colors.spacing.xl,
  },
  logoCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryBlue + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  logoCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  brandName: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    letterSpacing: -0.5,
    marginBottom: Colors.spacing.xs,
  },
  tagline: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grayText,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  waveContainer: {
    width: '120%',
    position: 'absolute',
    bottom: 180,
    zIndex: -1,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 45 : 35,
    left: Colors.spacing.xl,
    right: Colors.spacing.xl,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
  },
  loginHint: {
    marginTop: Colors.spacing.md,
    fontSize: 14,
    color: Colors.grayText,
    textAlign: 'center',
  },
  loginLink: {
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.semibold,
  },
  langToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 20,
    right: Colors.spacing.lg,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 2,
    zIndex: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: Colors.radius.md,
    padding: 24,
    ...Colors.shadow.medium,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 20,
    textAlign: 'center',
  },
  langOptionCard: {
    width: '100%',
    padding: 16,
    borderRadius: Colors.radius.sm,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },
  langOptionActive: {
    borderColor: Colors.primaryBlue,
    backgroundColor: Colors.primaryBlue + '08',
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.darkText,
  },
  langOptionTextActive: {
    color: Colors.primaryBlue,
  },
});
