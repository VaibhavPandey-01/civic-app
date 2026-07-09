import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, Key } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/common/Button';
import { loginWithEmail, loginWithBackend } from '../../services/authService';
import { validateEmail } from '../../utils/validators';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  
  const blob1X = useRef(new Animated.Value(-50)).current;
  const blob1Y = useRef(new Animated.Value(-50)).current;
  const blob2X = useRef(new Animated.Value(SCREEN_WIDTH - 100)).current;
  const blob2Y = useRef(new Animated.Value(SCREEN_HEIGHT - 200)).current;

  const animateBlobs = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1X, { toValue: SCREEN_WIDTH - 150, duration: 8000, useNativeDriver: true }),
          Animated.timing(blob1Y, { toValue: 200, duration: 6000, useNativeDriver: true }),
          Animated.timing(blob1X, { toValue: 50, duration: 7000, useNativeDriver: true }),
          Animated.timing(blob1Y, { toValue: -50, duration: 8000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(blob2X, { toValue: 0, duration: 9000, useNativeDriver: true }),
          Animated.timing(blob2Y, { toValue: SCREEN_HEIGHT - 400, duration: 7000, useNativeDriver: true }),
          Animated.timing(blob2X, { toValue: SCREEN_WIDTH - 200, duration: 8000, useNativeDriver: true }),
          Animated.timing(blob2Y, { toValue: SCREEN_HEIGHT - 200, duration: 6000, useNativeDriver: true }),
        ])
      ])
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    animateBlobs();
  }, []);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = (): boolean => {
    const next: typeof errors = {
      email: validateEmail(email),
      password: password.length < 6 ? 'Password is required' : undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');
    try {
      const idToken = await loginWithEmail(email, password);
      await loginWithBackend(idToken, email);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Animated.View style={[styles.glowBlob1, { transform: [{ translateX: blob1X }, { translateY: blob1Y }] }]} />
      <Animated.View style={[styles.glowBlob2, { transform: [{ translateX: blob2X }, { translateY: blob2Y }] }]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: cardFade, transform: [{ translateY: cardSlide }] }}>
            
            <View style={styles.logoRow}>
              <View style={styles.emojiLogoContainer}>
                <Text style={styles.emojiLogo}>🌏</Text>
              </View>
              <View style={styles.brandTextBox}>
                <Text style={styles.brandTitle}>CivicSafe</Text>
                <Text style={styles.brandSub}>SECURE & CLEAN INCIDENT TRACKER</Text>
              </View>
            </View>

            <View style={styles.glassContainer}>
              <BlurView intensity={70} tint="light" style={styles.blurCard}>
                <Text style={styles.heading}>{t('welcomeBack')}</Text>
                <Text style={styles.subheading}>{t('enterEmailSignIn')}</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('emailAddress')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isEmailFocused && styles.glowingInputRowActive,
                    Boolean(errors.email) && styles.glowingInputRowError
                  ]}>
                    <Mail size={18} color={isEmailFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('emailPlaceholder')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={email}
                      onChangeText={(val) => { setEmail(val); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorLabel}>{errors.email}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('passwordLabel')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isPasswordFocused && styles.glowingInputRowActive,
                    Boolean(errors.password) && styles.glowingInputRowError
                  ]}>
                    <Key size={18} color={isPasswordFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('passwordPlaceholder')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={password}
                      onChangeText={(val) => { setPassword(val); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      secureTextEntry
                    />
                  </View>
                  {errors.password ? <Text style={styles.errorLabel}>{errors.password}</Text> : null}
                </View>

                {submitError ? (
                  <Text style={styles.submitErrorText}>{submitError}</Text>
                ) : null}

                <Button
                  title={t('logIn')}
                  onPress={handleLogin}
                  loading={loading}
                  variant="primary"
                  style={styles.loginBtn}
                />
              </BlurView>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupHint}>{t('dontHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupLink}>{t('createAccountLink')}</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  glowBlob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    zIndex: -2,
  },
  glowBlob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    zIndex: -2,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Colors.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: Colors.spacing.xl,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingLeft: 4,
  },
  emojiLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...Colors.shadow.soft,
  },
  emojiLogo: {
    fontSize: 24,
  },
  brandTextBox: {
    marginLeft: Colors.spacing.md,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryBlue,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  glassContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    ...Colors.shadow.medium,
  },
  blurCard: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: Colors.grayText,
    lineHeight: 18,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  glowingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Colors.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    height: 52,
    paddingHorizontal: Colors.spacing.md,
  },
  glowingInputRowActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  glowingInputRowError: {
    borderColor: Colors.alertOrange,
  },
  inputIcon: {
    marginRight: Colors.spacing.sm,
  },
  textInput: {
    flex: 1,
    color: Colors.darkText,
    fontSize: 14,
  },
  errorLabel: {
    color: Colors.alertOrange,
    fontSize: 11,
    marginTop: 4,
  },
  submitErrorText: {
    color: Colors.alertOrange,
    fontSize: 12,
    marginBottom: 14,
  },
  loginBtn: {
    height: 50,
    borderRadius: Colors.radius.md,
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
    marginTop: 8,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4,
  },
  signupHint: { fontSize: 14, color: Colors.grayText },
  signupLink: {
    fontSize: 14,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
});
