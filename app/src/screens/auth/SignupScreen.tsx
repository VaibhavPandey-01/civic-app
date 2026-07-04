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
import { RoleSelector } from '../../components/auth/RoleSelector';
import { PhoneInput } from '../../components/auth/PhoneInput';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { registerWithEmail, registerWithBackend } from '../../services/authService';
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

  const handleCreateAccount = async () => {
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');
    try {

      const idToken = await registerWithEmail(email, password);
      
      // 2. register user in backend
      await registerWithBackend(idToken, {
        name: name.trim(),
        phone: `+91${phone.trim()}`,
        email: email.trim(),
        role,
        inviteCode: role === 'admin' ? inviteCode.trim() : undefined,
      });

    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
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
            <Text style={styles.heading}>{t('createAccount')}</Text>
            <Text style={styles.subheading}>
              {t('joinCommunity')}
            </Text>
          </View>

          <Card style={styles.card}>
            <RoleSelector
              selectedRole={role}
              onRoleChange={(r) => {
                setRole(r);
                clearErrors();
              }}
            />

            <Input
              label={t('fullName')}
              placeholder={t('fullName')}
              value={name}
              onChangeText={(t) => { setName(t); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
              error={errors.name}
              autoCapitalize="words"
              leftIcon={<User size={18} color={Colors.grayText} />}
            />

            <PhoneInput
              value={phone}
              onChangeText={(t) => { setPhone(t); if (errors.phone) setErrors((e) => ({ ...e, phone: undefined })); }}
              error={errors.phone}
            />

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

            {}
            {role === 'admin' && (
              <Input
                label="Admin Invite Code"
                placeholder="Enter your invite code"
                value={inviteCode}
                onChangeText={(t) => { setInviteCode(t); if (errors.inviteCode) setErrors((e) => ({ ...e, inviteCode: undefined })); }}
                error={errors.inviteCode}
                autoCapitalize="characters"
                leftIcon={<Key size={18} color={Colors.grayText} />}
              />
            )}

            {submitError ? (
              <Text style={styles.submitError}>{submitError}</Text>
            ) : null}

            <Button
              title={t('createAccount')}
              onPress={handleCreateAccount}
              loading={loading}
              style={styles.button}
            />
          </Card>

          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('logIn')}</Text>
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Colors.spacing.xl,
  },
  loginHint: { fontSize: Typography.fontSize.body, color: Colors.grayText },
  loginLink: {
    fontSize: Typography.fontSize.body,
    color: Colors.primaryBlue,
    fontWeight: Typography.fontWeight.semibold,
  },
});
