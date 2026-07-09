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
  Dimensions,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, MapPin, AlertTriangle, Shield, Globe } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../context/useSettingsStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_HEIGHT < 680;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const [langModalVisible, setLangModalVisible] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const logoRingAnim = useRef(new Animated.Value(1)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;

  const modalSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const floatAnimation = (val: Animated.Value, delay: number, offset: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, {
          toValue: offset,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: -offset,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 800,
        delay: 550,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRingAnim, {
          toValue: 1.15,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(logoRingAnim, {
          toValue: 0.98,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    floatAnimation(float1, 0, 10);
    floatAnimation(float2, 350, 12);
    floatAnimation(float3, 700, 8);
    floatAnimation(float4, 1100, 14);
  }, []);

  useEffect(() => {
    if (langModalVisible) {
      Animated.spring(modalSlide, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalSlide, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [langModalVisible]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.backgroundAccentOuter} />
      <View style={styles.backgroundAccentInner} />

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

      <View style={styles.flexContainer}>
        { }
        <View style={styles.bubbleTrack}>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float1 }], left: '8%', top: '12%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#EFF6FF' }]}>
              <Camera size={20} color="#2563EB" />
            </View>
          </Animated.View>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float2 }], right: '10%', top: '22%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#ECFDF5' }]}>
              <MapPin size={20} color="#10B981" />
            </View>
          </Animated.View>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float3 }], left: '12%', bottom: '32%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#FFF7ED' }]}>
              <AlertTriangle size={20} color="#F59E0B" />
            </View>
          </Animated.View>
          <Animated.View style={[styles.iconBubbleWrapper, { transform: [{ translateY: float4 }], right: '15%', bottom: '26%' }]}>
            <View style={[styles.iconBubble, { backgroundColor: '#EFF6FF' }]}>
              <Shield size={20} color="#2563EB" />
            </View>
          </Animated.View>
        </View>

        { }
        <View style={styles.logoSpacer} />

        { }
        <Animated.View
          style={[
            styles.logoBlock,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoHalo,
                { transform: [{ scale: logoRingAnim }] },
              ]}
            />
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌏</Text>
            </View>
          </View>

          <Text style={styles.brandName}>CivicSafe</Text>
          <Text style={styles.tagline}>{t('slogan')}</Text>
        </Animated.View>

        { }
        <Animated.View style={[styles.ctaContainer, { opacity: ctaAnim }]}>
          <Button
            title={t('getStarted')}
            onPress={() => navigation.navigate('Onboarding')}
            variant="primary"
            style={styles.ctaButton}
          />
          <View style={styles.loginRow}>
            <Text style={styles.loginHintText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>{t('logIn')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={20}
              tint="dark"
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalSlide }],
              },
            ]}
          >
            <View style={styles.drawerHandle} />

            <View style={styles.modalHeaderRow}>
              <Globe size={24} color={Colors.primaryBlue} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Choose Language / भाषा चुनें</Text>
            </View>
            <Text style={styles.modalSub}>Select your preferred display language for reporting:</Text>

            <TouchableOpacity
              style={[styles.langOptionCard, language === 'en' ? styles.langOptionActive : null]}
              onPress={() => {
                setLanguage('en');
                setLangModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.langOptionText, language === 'en' ? styles.langOptionTextActive : null]}>English</Text>
              {language === 'en' && <View style={styles.optionIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOptionCard, language === 'hi' ? styles.langOptionActive : null]}
              onPress={() => {
                setLanguage('hi');
                setLangModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.langOptionText, language === 'hi' ? styles.langOptionTextActive : null]}>हिंदी (Hindi)</Text>
              {language === 'hi' && <View style={styles.optionIndicator} />}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flexContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Colors.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  logoSpacer: {
    height: IS_SMALL_DEVICE ? 10 : 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Colors.shadow.medium,
  },
  logoEmoji: {
    fontSize: 48,
  },
  backgroundAccentOuter: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
    zIndex: -2,
  },
  backgroundAccentInner: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#ECFDF5',
    opacity: 0.6,
    zIndex: -2,
  },
  bubbleTrack: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  iconBubbleWrapper: {
    position: 'absolute',
    ...Colors.shadow.soft,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoBlock: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.md,
  },
  logoHalo: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  brandName: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    letterSpacing: -1,
    marginBottom: Colors.spacing.xs,
  },
  tagline: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.grayText,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: Colors.radius.md,
    ...Colors.shadow.medium,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Colors.spacing.md,
    gap: 4,
  },
  loginHintText: {
    fontSize: 14,
    color: Colors.grayText,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  langToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: Colors.spacing.lg,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: Colors.radius.sm,
    padding: 2,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: Colors.radius.lg,
    borderTopRightRadius: Colors.radius.lg,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    ...Colors.shadow.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 20,
    lineHeight: 18,
  },
  langOptionCard: {
    width: '100%',
    padding: 16,
    borderRadius: Colors.radius.sm,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langOptionActive: {
    borderColor: Colors.primaryBlue,
    backgroundColor: '#EFF6FF',
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  langOptionTextActive: {
    color: Colors.primaryBlue,
  },
  optionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryBlue,
  },
});
