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
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User, Mail, Key } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { Button } from '../../components/common/Button';
import { registerWithEmail, registerWithBackend, sendFirebaseVerificationEmail, checkEmailVerified } from '../../services/authService';
import { firebaseAuth } from '../../config/firebaseConfig';
import {
  validatePhone,
  validateEmail,
  validateName,
  validateInviteCode,
} from '../../utils/validators';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isInviteFocused, setIsInviteFocused] = useState(false);

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

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
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    inviteCode?: string;
  }>({});

  const clearErrors = () => {
    setErrors({});
    setSubmitError('');
  };

  const validate = (): boolean => {
    const next: typeof errors = {
      name: validateName(name),
      phone: validatePhone(phone),
      email: validateEmail(email),
      password: password.length < 6 ? 'Password must be at least 6 characters' : undefined,
      inviteCode: role === 'admin' ? validateInviteCode(inviteCode) : undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationVerifying, setVerificationVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationResent, setVerificationResent] = useState(false);

  const handleCreateAccount = async () => {
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');
    try {
      await registerWithEmail(email.trim(), password);
      await sendFirebaseVerificationEmail();
      setVerificationModalVisible(true);
      setVerificationResent(false);
      setVerificationError('');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    setVerificationError('');
    setVerificationVerifying(true);
    try {
      const isVerified = await checkEmailVerified();
      if (!isVerified) {
        setVerificationError('Email is not verified yet. Please check your inbox and click the verification link.');
        setVerificationVerifying(false);
        return;
      }

      setVerificationModalVisible(false);
      setLoading(true);

      if (firebaseAuth.currentUser) {
        const idToken = await firebaseAuth.currentUser.getIdToken();
        await registerWithBackend(idToken, {
          name: name.trim(),
          phone: `+91${phone.trim()}`,
          email: email.trim(),
          role,
          inviteCode: role === 'admin' ? inviteCode.trim() : undefined,
        });
      }
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Verification failed.');
    } finally {
      setVerificationVerifying(false);
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setVerificationError('');
    setVerificationResent(false);
    try {
      await sendFirebaseVerificationEmail();
      setVerificationResent(true);
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Failed to resend verification email.');
    }
  };

  const handleCancelVerification = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await firebaseAuth.currentUser.delete();
      }
    } catch (err) {
      console.warn('Failed to delete temporary user on cancel', err);
    }
    setVerificationModalVisible(false);
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
                <Text style={styles.heading}>{t('createAccount')}</Text>
                <Text style={styles.subheading}>{t('joinCommunity')}</Text>

                <View style={styles.roleSelectorWrapper}>
                  <RoleSelector
                    selectedRole={role}
                    onRoleChange={(r) => {
                      setRole(r);
                      clearErrors();
                    }}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>{t('fullName')}</Text>
                  <View style={[
                    styles.glowingInputRow,
                    isNameFocused && styles.glowingInputRowActive,
                    Boolean(errors.name) && styles.glowingInputRowError
                  ]}>
                    <User size={18} color={isNameFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('fullName')}
                      placeholderTextColor="rgba(156, 163, 175, 0.7)"
                      value={name}
                      onChangeText={(val) => { setName(val); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.name ? <Text style={styles.errorLabel}>{errors.name}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <PhoneInput
                    value={phone}
                    onChangeText={(val) => { setPhone(val); if (errors.phone) setErrors((e) => ({ ...e, phone: undefined })); }}
                    error={errors.phone}
                    theme="light"
                  />
                </View>

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

                {role === 'admin' && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Admin Invite Code</Text>
                    <View style={[
                      styles.glowingInputRow,
                      isInviteFocused && styles.glowingInputRowActive,
                      Boolean(errors.inviteCode) && styles.glowingInputRowError
                    ]}>
                      <Key size={18} color={isInviteFocused ? '#2563EB' : '#9CA3AF'} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your invite code"
                        placeholderTextColor="rgba(156, 163, 175, 0.7)"
                        value={inviteCode}
                        onChangeText={(val) => { setInviteCode(val); if (errors.inviteCode) setErrors((e) => ({ ...e, inviteCode: undefined })); }}
                        onFocus={() => setIsInviteFocused(true)}
                        onBlur={() => setIsInviteFocused(false)}
                        autoCapitalize="characters"
                      />
                    </View>
                    {errors.inviteCode ? <Text style={styles.errorLabel}>{errors.inviteCode}</Text> : null}
                  </View>
                )}

                {submitError ? (
                  <Text style={styles.submitErrorText}>{submitError}</Text>
                ) : null}

                <Button
                  title={t('createAccount')}
                  onPress={handleCreateAccount}
                  loading={loading}
                  variant="primary"
                  style={styles.signupBtn}
                />
              </BlurView>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.loginLink}>{t('logIn')}</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {verificationModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCancelVerification}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
          </TouchableOpacity>

          <View style={styles.modalCenterCardContainer}>
            <View style={styles.otpSolidCard}>
              <Text style={styles.modalTitle}>{t('verifyEmail') || 'Verify Your Email'}</Text>
              <Text style={styles.modalSub}>
                We have sent a verification link to your email address:
                {"\n"}
                <Text style={{ fontWeight: 'bold', color: Colors.primaryBlue }}>{email}</Text>
                {"\n\n"}
                Please click the link in your email inbox to verify, then tap Continue.
              </Text>

              {verificationError ? <Text style={[styles.errorLabel, { textAlign: 'center', marginBottom: 10 }]}>{verificationError}</Text> : null}
              {verificationResent ? <Text style={styles.resendSuccessText}>Verification email resent successfully!</Text> : null}

              <View style={styles.modalActionsRow}>
                <Button
                  title="Cancel"
                  onPress={handleCancelVerification}
                  variant="secondary"
                  style={[styles.halfBtn, { paddingHorizontal: 0 }]}
                  textStyle={{ fontSize: 13 }}
                />
                <Button
                  title="Continue"
                  onPress={handleVerifyAndRegister}
                  loading={verificationVerifying}
                  variant="primary"
                  style={[styles.halfBtn, { paddingHorizontal: 0 }]}
                  textStyle={{ fontSize: 13 }}
                />
              </View>

              <TouchableOpacity onPress={handleResendEmail} style={styles.resendLinkBtn} activeOpacity={0.7}>
                <Text style={styles.resendLinkText}>Resend Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  roleSelectorWrapper: {
    marginBottom: 20,
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
  signupBtn: {
    height: 50,
    borderRadius: Colors.radius.md,
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
    marginTop: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4,
  },
  loginHint: { fontSize: 14, color: Colors.grayText },
  loginLink: {
    fontSize: 14,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalCenterCardContainer: {
    width: '100%',
    maxWidth: 340,
  },
  otpSolidCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...Colors.shadow.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: Colors.grayText,
    marginBottom: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  halfBtn: {
    flex: 1,
    height: 46,
  },
  resendLinkBtn: {
    marginTop: 20,
    padding: 4,
  },
  resendLinkText: {
    fontSize: 13,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.bold,
  },
  resendSuccessText: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
