import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User, Mail, Key } from 'lucide-react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { loginWithEmail, loginWithBackend } from '../../services/authService';
import { validateEmail } from '../../utils/validators';
import { AuthStackParamList } from '../../types/navigation.types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const clearErrors = () => {
    setErrors({});
    setSubmitError('');
  };

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
      
      // 2. login to backend
      await loginWithBackend(idToken, email);
      

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.heading}>{t('welcomeBack')}</Text>
            <Text style={styles.subheading}>
              {t('enterEmailSignIn')}
            </Text>
          </View>

          <Card style={styles.card}>

            <Input
              label={t('emailAddress')}
              placeholder={t('emailPlaceholder')}
              value={email}
              onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={Colors.grayText} />}
            />

            <Input
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
              error={errors.password}
              secureTextEntry
              leftIcon={<Key size={18} color={Colors.grayText} />}
            />

            {submitError ? (
              <Text style={styles.submitError}>{submitError}</Text>
            ) : null}

            <Button
              title={t('logIn')}
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />
          </Card>

          <View style={styles.signupRow}>
            <Text style={styles.signupHint}>{t('dontHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>{t('createAccountLink')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Colors.spacing.lg,
    paddingTop: Colors.spacing.xl,
    paddingBottom: Colors.spacing.xl,
  },
  header: { marginBottom: Colors.spacing.xl },
  heading: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Colors.spacing.xs,
  },
  subheading: {
    fontSize: Typography.fontSize.body,
    color: Colors.grayText,
    lineHeight: Typography.lineHeight.body,
  },
  card: { padding: Colors.spacing.lg },
  submitError: {
    fontSize: Typography.fontSize.caption,
    color: Colors.alertOrange,
    marginBottom: Colors.spacing.sm,
    lineHeight: Typography.lineHeight.caption,
  },
  button: { marginTop: Colors.spacing.xs },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Colors.spacing.xl,
  },
  signupHint: { fontSize: Typography.fontSize.body, color: Colors.grayText },
  signupLink: {
    fontSize: Typography.fontSize.body,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.semibold,
  },
});
