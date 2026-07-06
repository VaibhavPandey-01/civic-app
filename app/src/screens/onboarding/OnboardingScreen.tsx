import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, Navigation, Activity, LucideIcon } from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../context/useSettingsStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  Icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 'report',
    Icon: Camera,
    iconColor: Colors.primaryBlue,
    title: 'Report in Real-Time',
    description:
      'Capture photo evidence on the spot with your camera. Your GPS location and timestamp are automatically recorded — no gallery uploads allowed, ensuring authentic evidence.',
  },
  {
    id: 'route',
    Icon: Navigation,
    iconColor: Colors.environmentalGreen,
    title: 'Automatic Routing',
    description:
      'Reports are instantly routed to the right department — Municipal Sanitation for pollution, Police & Emergency for suspicious objects. No manual guesswork needed.',
  },
  {
    id: 'track',
    Icon: Activity,
    iconColor: Colors.alertOrange,
    title: 'Track Live Progress',
    description:
      'Follow your report through 5 stages: Submitted → Under Review → Assigned → Action Started → Resolved. Get push notifications at every step.',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { setLanguage, language } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [langModalVisible, setLangModalVisible] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const selectLanguage = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setLangModalVisible(false);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  const translatedSlides = SLIDES.map((slide) => {
    let titleKey: 'slide1Title' | 'slide2Title' | 'slide3Title' = 'slide1Title';
    let descKey: 'slide1Desc' | 'slide2Desc' | 'slide3Desc' = 'slide1Desc';
    if (slide.id === 'route') {
      titleKey = 'slide2Title';
      descKey = 'slide2Desc';
    } else if (slide.id === 'track') {
      titleKey = 'slide3Title';
      descKey = 'slide3Desc';
    }
    return {
      ...slide,
      title: t(titleKey),
      description: t(descKey),
    };
  });

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
              onPress={() => selectLanguage('en')}
            >
              <Text style={[styles.langOptionText, language === 'en' ? styles.langOptionTextActive : null]}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langOptionCard, language === 'hi' ? styles.langOptionActive : null]}
              onPress={() => selectLanguage('hi')}
            >
              <Text style={[styles.langOptionText, language === 'hi' ? styles.langOptionTextActive : null]}>हिंदी (Hindi)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.skipText}>{t('skip')}</Text>
      </TouchableOpacity>

      {}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {translatedSlides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {}
            <View
              style={[
                styles.illustrationCircle,
                { backgroundColor: slide.iconColor + '14' },
              ]}
            >
              <View
                style={[
                  styles.illustrationInner,
                  { backgroundColor: slide.iconColor + '22' },
                ]}
              >
                <slide.Icon size={52} color={slide.iconColor} />
              </View>
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {}
      <View style={styles.footer}>
        <Button
          title={isLast ? t('getStarted') : t('next')}
          onPress={goToNext}
          variant="primary"
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Colors.spacing.lg,
    paddingTop: Colors.spacing.md,
    paddingBottom: Colors.spacing.sm,
  },
  skipText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grayText,
    fontWeight: Typography.fontWeight.semibold,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Colors.spacing.xl,
    paddingBottom: 100,
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Colors.spacing.xl,
  },
  illustrationInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: Colors.spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.body,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Colors.spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primaryBlue,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  footer: {
    paddingHorizontal: Colors.spacing.xl,
    paddingBottom: Colors.spacing.xl,
  },
  nextButton: {
    width: '100%',
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
